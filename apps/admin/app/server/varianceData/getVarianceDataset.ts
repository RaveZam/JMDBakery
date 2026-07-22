"use server";
import { createClient } from "@/utils/supabase/server";

export type VarianceRecord = {
  sessionId: string;
  date: string;
  productId: string;
  morning: number;
  sold: number;
  boQty: number;
  ending: number;
  expected: number;
  variance: number;
};

type RawSessionInventory = { product_id: string; quantity: number | null };
type RawEndingInventory = { product_id: string; quantity: number | null };
type RawSale = {
  product_id: string | null;
  quantity_sold: number | null;
  quantity_bo: number | null;
};
type RawSessionStore = { sales: RawSale[] };
type RawSession = {
  id: string;
  session_date: string;
  session_inventory: RawSessionInventory[];
  ending_inventory: RawEndingInventory[];
  session_stores: RawSessionStore[];
};

const DATASET_WINDOW_MONTHS = 1;

function windowStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - DATASET_WINDOW_MONTHS);
  return d.toISOString().slice(0, 10);
}

type ProductTotals = {
  morning: number;
  sold: number;
  boQty: number;
  ending: number;
};

function getEntry(
  totals: Map<string, ProductTotals>,
  productId: string,
): ProductTotals {
  let entry = totals.get(productId);
  if (!entry) {
    entry = { morning: 0, sold: 0, boQty: 0, ending: 0 };
    totals.set(productId, entry);
  }
  return entry;
}

// ending_inventory/session_inventory are keyed per (route_session_id,
// product_id) -- one end-of-route total, not per store. Mirrors the same
// morning/sold/back_order/ending totals as the get_session_inventory_summary
// RPC, just aggregated in JS across the whole dashboard date window instead
// of one session at a time.
function sumSessionTotals(session: RawSession): Map<string, ProductTotals> {
  const totals = new Map<string, ProductTotals>();

  for (const row of session.session_inventory) {
    getEntry(totals, row.product_id).morning += row.quantity ?? 0;
  }
  for (const row of session.ending_inventory) {
    getEntry(totals, row.product_id).ending += row.quantity ?? 0;
  }
  for (const store of session.session_stores) {
    for (const sale of store.sales) {
      if (!sale.product_id) continue;
      const entry = getEntry(totals, sale.product_id);
      entry.sold += sale.quantity_sold ?? 0;
      entry.boQty += sale.quantity_bo ?? 0;
    }
  }

  return totals;
}

function mapSession(session: RawSession): VarianceRecord[] {
  const totals = sumSessionTotals(session);

  return Array.from(totals.entries()).map(([productId, t]) => {
    const expected = t.morning - t.sold - t.boQty;
    return {
      sessionId: session.id,
      date: session.session_date,
      productId,
      morning: t.morning,
      sold: t.sold,
      boQty: t.boQty,
      ending: t.ending,
      expected,
      variance: t.ending - expected,
    };
  });
}

/**
 * Single source of truth for the dashboard's variance KPI: a fixed wide
 * window of per-(session, product) inventory variance rows, cached
 * client-side via React Query. The dashboard applies its own date-range
 * filter against this in memory, same as getSalesDataset.
 */
export const getVarianceDataset = async (): Promise<VarianceRecord[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("route_sessions")
    .select(
      `
      id, session_date,
      session_inventory(product_id, quantity),
      ending_inventory(product_id, quantity),
      session_stores!inner(sales(product_id, quantity_sold, quantity_bo))
    `,
    )
    .gte("session_date", windowStartDate())
    .order("session_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawSession[];
  return rows.flatMap(mapSession);
};
