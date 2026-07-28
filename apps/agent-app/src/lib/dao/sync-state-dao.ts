import { getDb } from "@/src/lib/db";

export const SyncStateDao = {
  getLastSyncedAt(tableName: string): string | null {
    const row = getDb().getFirstSync<{ last_synced_at: string }>(
      `SELECT last_synced_at FROM sync_state WHERE table_name = ?`,
      [tableName],
    );
    return row?.last_synced_at ?? null;
  },

  setLastSyncedAt(tableName: string, lastSyncedAt: string): void {
    getDb().runSync(
      `INSERT OR REPLACE INTO sync_state (table_name, last_synced_at) VALUES (?, ?)`,
      [tableName, lastSyncedAt],
    );
  },
};
