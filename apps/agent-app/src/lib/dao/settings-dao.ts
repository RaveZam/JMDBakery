import { getDb } from "@/src/lib/db";

export const SettingsDao = {
  get(key: string): string | null {
    const row = getDb().getFirstSync<{ value: string | null }>(
      `SELECT value FROM app_settings WHERE key = ?`,
      [key],
    );
    return row?.value ?? null;
  },

  /** A null value removes the setting, so "unset" has one representation. */
  set(key: string, value: string | null): void {
    if (value === null) {
      getDb().runSync(`DELETE FROM app_settings WHERE key = ?`, [key]);
      return;
    }
    getDb().runSync(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
      [key, value],
    );
  },
};
