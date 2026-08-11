"use server";
import { createClient } from "@/utils/supabase/server";
import { manilaDateKey, windowStartDate } from "@/app/server/datasetWindow";
import type { CreditPayment } from "@/app/features/records/types";

type RawCreditPayment = {
  id: string;
  amount: number | null;
  note: string | null;
  created_at: string;
  recorded_by_name: string | null;
  tendered_by_name: string | null;
  stores: { store_name: string | null; province: string | null } | null;
};

function mapCreditPayment(row: RawCreditPayment): CreditPayment {
  const encodedBy = row.recorded_by_name ?? "Unknown";

  return {
    id: row.id,
    date: manilaDateKey(row.created_at),
    store: row.stores?.store_name ?? "",
    province: row.stores?.province ?? "",
    // tendered_by is only written when someone other than the encoder took
    // the cash, so a null here means the encoder collected it themselves.
    collectedBy: row.tendered_by_name ?? encodedBy,
    encodedBy,
    note: row.note,
    amount: row.amount ?? 0,
  };
}

/**
 * Credit repayments from the last month, newest first. Payments live in the
 * credit ledger rather than in sales, so the Records page fetches them
 * separately from the sales dataset.
 */
export const getCreditPayments = async (): Promise<CreditPayment[]> => {
  const supabase = await createClient();

  const since = windowStartDate();

  const { data, error } = await supabase
    .from("store_credit_entries")
    .select(
      `
      id, amount, note, created_at, recorded_by_name, tendered_by_name,
      stores(store_name, province)
    `,
    )
    .eq("entry_type", "payment")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load credit payments since ${since}: ${error.message}`,
    );
  }

  // The join is many-to-one, but without generated DB types Supabase infers
  // stores as an array, so the row shape is asserted here.
  const rows = (data ?? []) as unknown as RawCreditPayment[];

  return rows.map(mapCreditPayment);
};
