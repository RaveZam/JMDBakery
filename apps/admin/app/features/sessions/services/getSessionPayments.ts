"use server";

import { createClient } from "@/utils/supabase/server";
import type { SessionPaymentRow } from "../types/session-types";

type StoreCreditPaymentQueryRow = {
  id: string;
  session_store_id: string;
  amount: number | string;
  note: string | null;
  recorded_by_name: string | null;
  created_at: string;
};

// Credit payments collected on this session's visits, oldest first. A payment
// belongs to the session only when its session_store_id is one of its visits.
export async function getSessionPayments(
  sessionId: string,
): Promise<SessionPaymentRow[]> {
  const supabase = await createClient();

  const { data: storeRows, error: storesError } = await supabase
    .from("session_stores")
    .select("id")
    .eq("route_session_id", sessionId);

  if (storesError) throw new Error(storesError.message);

  const sessionStoreIds = (storeRows ?? []).map((row) => row.id as string);
  if (sessionStoreIds.length === 0) return [];

  const { data, error } = await supabase
    .from("store_credit_entries")
    .select("id, session_store_id, amount, note, recorded_by_name, created_at")
    .eq("entry_type", "payment")
    .in("session_store_id", sessionStoreIds)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as StoreCreditPaymentQueryRow[];
  return rows.map((row) => ({
    id: row.id,
    sessionStoreId: row.session_store_id,
    amount: Number(row.amount),
    note: row.note,
    recordedByName: row.recorded_by_name,
    createdAt: row.created_at,
  }));
}
