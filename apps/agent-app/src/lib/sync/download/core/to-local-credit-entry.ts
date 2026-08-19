export type RemoteStoreCreditRow = {
  id: string;
  store_id: string;
  session_store_id: string | null;
  entry_type: "credit" | "payment";
  amount: number;
  note: string | null;
  recorded_by: string;
  recorded_by_name: string | null;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
};

/**
 * Reshapes a pulled `store_credit_entries` row for StoreCreditDao.upsertEntry.
 * Drops the sync-only columns (`deleted_at`, `updated_at`) — locally a deleted
 * row is simply gone, and the cursor is tracked in `sync_state` instead.
 */
export function toLocalCreditEntry(row: RemoteStoreCreditRow) {
  return {
    id: row.id,
    store_id: row.store_id,
    session_store_id: row.session_store_id,
    entry_type: row.entry_type,
    amount: row.amount,
    note: row.note,
    recorded_by: row.recorded_by,
    recorded_by_name: row.recorded_by_name,
    created_at: row.created_at,
  };
}
