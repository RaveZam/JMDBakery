"use server";
import { createClient } from "@/utils/supabase/server";
import { getAgentMap } from "@/app/server/getAgentMap";

export type SalesRecord = {
  id: string;
  sessionId: string;
  date: string;
  createdAt: string | null;
  agent: string;
  store: string;
  province: string;
  product: string;
  soldQty: number;
  boQty: number;
  unitPrice: number;
  total: number;
};

type RawSale = {
  id: string;
  created_at: string | null;
  snapshot_product_name: string | null;
  quantity_sold: number | null;
  quantity_bo: number | null;
  snapshot_price: number | null;
  total: number | null;
};

type RawSessionStore = {
  stores: { store_name: string | null; province: string | null } | null;
  sales: RawSale[];
};

type RawSession = {
  id: string;
  session_date: string;
  conducted_by: string | null;
  session_stores: RawSessionStore[];
};

const DATASET_WINDOW_MONTHS = 12;

function windowStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - DATASET_WINDOW_MONTHS);
  return d.toISOString().slice(0, 10);
}

function mapSessionStore(
  sessionStore: RawSessionStore,
  session: RawSession,
  agent: string,
): SalesRecord[] {
  const store = sessionStore.stores?.store_name ?? "";
  const province = sessionStore.stores?.province ?? "";

  return sessionStore.sales.map((sale) => ({
    id: sale.id,
    sessionId: session.id,
    date: session.session_date,
    createdAt: sale.created_at ?? null,
    agent,
    store,
    province,
    product: sale.snapshot_product_name ?? "",
    soldQty: sale.quantity_sold ?? 0,
    boQty: sale.quantity_bo ?? 0,
    unitPrice: sale.snapshot_price ?? 0,
    total: sale.total ?? 0,
  }));
}

/**
 * Single source of truth for Dashboard/Intelligence/Records: a fixed wide
 * window of sales rows, cached 5min client-side via React Query. Each page
 * applies its own date-range filter/aggregation against this in memory.
 */
export const getSalesDataset = async (): Promise<SalesRecord[]> => {
  const [supabase, agentMap] = await Promise.all([
    createClient(),
    getAgentMap(),
  ]);

  const { data, error } = await supabase
    .from("route_sessions")
    .select(
      `
      id, session_date, conducted_by,
      session_stores!inner(
        sales(*),
        stores(store_name, province)
      )
    `,
    )
    .gte("session_date", windowStartDate())
    .order("session_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawSession[];

  return rows.flatMap((session) => {
    const agent = agentMap[session.conducted_by ?? ""]?.name ?? "Unknown";
    return session.session_stores.flatMap((sessionStore) =>
      mapSessionStore(sessionStore, session, agent),
    );
  });
};
