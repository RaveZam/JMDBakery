import { getDb } from "@/src/lib/db";

export type StoreCreditEntryRow = {
  id: string;
  store_id: string;
  // The visit this entry belongs to: the one whose orders a credit is derived
  // from, or the one a payment was collected on. Null only on payments taken
  // before the app recorded where a payment happened.
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

  getById(id: string): StoreCreditEntryRow | null {
    return (
      getDb().getFirstSync<StoreCreditEntryRow>(
        `SELECT * FROM store_credit_entries WHERE id = ?`,
        [id],
      ) ?? null
    );
  },

  updateAmount(id: string, amount: number): void {
    getDb().runSync(`UPDATE store_credit_entries SET amount = ? WHERE id = ?`, [
      amount,
      id,
    ]);
  },

  deleteEntry(id: string): void {
    getDb().runSync(`DELETE FROM store_credit_entries WHERE id = ?`, [id]);
  },

  getByStoreId(storeId: string): StoreCreditEntryRow[] {
    return getDb().getAllSync<StoreCreditEntryRow>(
      `SELECT * FROM store_credit_entries WHERE store_id = ? ORDER BY created_at DESC`,
      [storeId],
    );
  },

  // The visit's derived credit row, if it has one. Scoped to 'credit' so it
  // never returns a payment that shares the same session_store_id — syncVisitCredit
  // rewrites whatever this hands back.
  getCreditBySessionStoreId(sessionStoreId: string): StoreCreditEntryRow | null {
    return (
      getDb().getFirstSync<StoreCreditEntryRow>(
        `SELECT * FROM store_credit_entries WHERE session_store_id = ? AND entry_type = 'credit'`,
        [sessionStoreId],
      ) ?? null
    );
  },

  // The payments collected on the given visits, oldest first. Used by the
  // session history, which lists them under the store they were taken at.
  getPaymentsBySessionStoreIds(sessionStoreIds: string[]): StoreCreditEntryRow[] {
    if (sessionStoreIds.length === 0) return [];
    const placeholders = sessionStoreIds.map(() => "?").join(",");
    return getDb().getAllSync<StoreCreditEntryRow>(
      `SELECT * FROM store_credit_entries
       WHERE entry_type = 'payment' AND session_store_id IN (${placeholders})
       ORDER BY created_at ASC`,
      sessionStoreIds,
    );
  },

  //This returns all of the store that doesnt exist in store_credit_synced_stores, i
  //Store ids that are never synced gets returned.
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
