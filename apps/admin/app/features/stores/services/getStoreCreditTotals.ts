"use server";

import { createClient } from "@/utils/supabase/server";
import type { StoreCredit } from "../types/store-types";

type StoreCreditTotalsRow = {
  store_id: string;
  credit_taken: number | string;
  paid_back: number | string;
  balance: number | string;
  last_payment_at: string | null;
};

/**
 * All-time credit totals for every store that has at least one entry, used
 * to stamp the "Owes ₱X" badge across the whole store list at once.
 */
export async function getStoreCreditTotals(): Promise<StoreCredit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_store_credit_totals");

  if (error) throw new Error(error.message);

  return ((data ?? []) as StoreCreditTotalsRow[]).map((row) => ({
    storeId: row.store_id,
    creditTaken: Number(row.credit_taken),
    paidBack: Number(row.paid_back),
    balance: Number(row.balance),
    lastPaymentAt: row.last_payment_at,
  }));
}
