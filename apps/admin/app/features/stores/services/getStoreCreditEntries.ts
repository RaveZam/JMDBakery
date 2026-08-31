"use server";

import { createClient } from "@/utils/supabase/server";
import type { CreditLedgerEntry } from "../types/store-types";

type StoreCreditEntryRow = {
  id: string;
  entry_type: "credit" | "payment";
  amount: number | string;
  note: string | null;
  recorded_by_name: string | null;
  tendered_by_name: string | null;
  created_at: string;
};

/**
 * Full, all-time credit ledger for a single store, newest first.
 */
export async function getStoreCreditEntries(
  storeId: string,
): Promise<CreditLedgerEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_store_credit_entries", {
    p_store_id: storeId,
  });

  if (error) throw new Error(error.message);

  return ((data ?? []) as StoreCreditEntryRow[]).map((row) => ({
    id: row.id,
    entryType: row.entry_type,
    amount: Number(row.amount),
    note: row.note,
    recordedByName: row.recorded_by_name,
    // A null tendered_by means the encoder collected the cash themselves.
    tenderedByName: row.tendered_by_name ?? row.recorded_by_name,
    createdAt: row.created_at,
  }));
}
