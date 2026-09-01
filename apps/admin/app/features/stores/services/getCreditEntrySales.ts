"use server";

import { createClient } from "@/utils/supabase/server";
import type { CreditEntrySale } from "../types/store-types";

type SaleRow = {
  id: string;
  snapshot_product_name: string | null;
  snapshot_price: number | string | null;
  quantity_sold: number | null;
  quantity_bo: number | null;
  bo_reason: string | null;
  total: number | string | null;
};

/**
 * The sale lines a credit entry was raised against, newest visit line first.
 *
 * There is no junction table between the two. The link is the visit: a credit
 * entry names a session_store_id, and the orders logged on that visit carry
 * the same one. A visit can be settled part cash and part credit, so only the
 * credit lines are returned — the cash half of a mixed stop was never owed.
 *
 * Returns an empty array for a payment entry, or for a credit logged against
 * the store rather than a delivery. Both are normal, not errors.
 */
export async function getCreditEntrySales(
  creditEntryId: string,
): Promise<CreditEntrySale[]> {
  const supabase = await createClient();

  // The ledger RPC does not return session_store_id, so the visit has to be
  // looked up from the entry before the sales can be found.
  const { data: entry, error: entryError } = await supabase
    .from("store_credit_entries")
    .select("session_store_id")
    .eq("id", creditEntryId)
    .is("deleted_at", null)
    .maybeSingle();

  if (entryError) throw new Error(entryError.message);
  if (!entry?.session_store_id) return [];

  const { data, error } = await supabase
    .from("sales")
    .select(
      "id, snapshot_product_name, snapshot_price, quantity_sold, quantity_bo, bo_reason, total",
    )
    .eq("session_store_id", entry.session_store_id)
    .eq("payment_type", "credit")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return ((data ?? []) as SaleRow[]).map((row) => ({
    id: row.id,
    productName: row.snapshot_product_name ?? "Unknown product",
    price: Number(row.snapshot_price ?? 0),
    quantitySold: Number(row.quantity_sold ?? 0),
    quantityBadOrder: Number(row.quantity_bo ?? 0),
    badOrderReason: row.bo_reason,
    total: Number(row.total ?? 0),
  }));
}
