"use server";

import { createClient } from "@/utils/supabase/server";
import type { SessionSaleRow } from "../types/session-types";

type SaleQueryRow = {
  snapshot_product_name: string;
  snapshot_price: number | string;
  quantity_sold: number;
  quantity_bo: number;
  total: number | string;
};

// Every sale logged across this session's visits, cash and credit together.
// A sale belongs to the session only when its session_store_id is one of its visits.
export async function getSessionSales(
  sessionId: string,
): Promise<SessionSaleRow[]> {
  const supabase = await createClient();

  const { data: storeRows, error: storesError } = await supabase
    .from("session_stores")
    .select("id")
    .eq("route_session_id", sessionId);

  if (storesError) throw new Error(storesError.message);

  const sessionStoreIds = (storeRows ?? []).map((row) => row.id as string);
  if (sessionStoreIds.length === 0) return [];

  const { data, error } = await supabase
    .from("sales")
    .select(
      "snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, total",
    )
    .in("session_store_id", sessionStoreIds);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as SaleQueryRow[];
  return rows.map((row) => ({
    productName: row.snapshot_product_name,
    price: Number(row.snapshot_price),
    quantitySold: row.quantity_sold,
    quantityBO: row.quantity_bo,
    total: Number(row.total),
  }));
}
