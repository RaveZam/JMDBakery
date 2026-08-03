import { getDb } from "@/src/lib/db";

export type StoreCreditEntryRow = {
  id: string;
  store_id: string;
  session_store_id: string | null;
  entry_type: "credit" | "payment";
  amount: number;
  note: string | null;
  recorded_by: string;
  recorded_by_name: string | null;
  created_at: string;
};

const StoreCreditDao = {
  upsertEntry(entry: StoreCreditEntryRow) {
    getDb().runSync(
      `INSERT OR REPLACE INTO store_credit_entries
         (id, store_id, session_store_id, entry_type, amount, note, recorded_by, recorded_by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.store_id,
        entry.session_store_id,
        entry.entry_type,
        entry.amount,
        entry.note,
        entry.recorded_by,
        entry.recorded_by_name,
        entry.created_at,
      ],
    );
  },

  deleteEntry(id: string): void {
    getDb().runSync(`DELETE FROM store_credit_entries WHERE id = ?`, [id]);
  },

  deleteBySessionStoreId(sessionStoreId: string): void {
    getDb().runSync(
      `DELETE FROM store_credit_entries WHERE session_store_id = ?`,
      [sessionStoreId],
    );
  },

  getByStoreId(storeId: string): StoreCreditEntryRow[] {
    return getDb().getAllSync<StoreCreditEntryRow>(
      `SELECT * FROM store_credit_entries WHERE store_id = ? ORDER BY created_at DESC`,
      [storeId],
    );
  },

  getBySessionStoreId(sessionStoreId: string): StoreCreditEntryRow | null {
    return (
      getDb().getFirstSync<StoreCreditEntryRow>(
        `SELECT * FROM store_credit_entries WHERE session_store_id = ?`,
        [sessionStoreId],
      ) ?? null
    );
  },

  // Backfill bookkeeping: stores whose full credit history has already been
  // pulled once. See downloadStoreCreditEntries in src/lib/sync/download.ts.
  getUnsyncedStoreIds(storeIds: string[]): string[] {
    if (storeIds.length === 0) return [];
    const placeholders = storeIds.map(() => "?").join(",");
    const synced = getDb().getAllSync<{ store_id: string }>(
      `SELECT store_id FROM store_credit_synced_stores WHERE store_id IN (${placeholders})`,
      storeIds,
    );
    const syncedIds = new Set(synced.map((row) => row.store_id));
    return storeIds.filter((id) => !syncedIds.has(id));
  },

  markStoresSynced(storeIds: string[]): void {
    for (const storeId of storeIds) {
      getDb().runSync(
        `INSERT OR IGNORE INTO store_credit_synced_stores (store_id) VALUES (?)`,
        [storeId],
      );
    }
  },
};

export default StoreCreditDao;
