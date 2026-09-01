import { getDb } from "@/src/lib/db";

// Child tables first so foreign keys stay satisfied inside the transaction.
// Auth lives in expo-sqlite/localStorage, not this database, so it survives.
// app_settings is left alone too — device trust is cleared separately.
const TABLES_IN_DELETE_ORDER = [
  "sales",
  "ending_inventory",
  "session_inventory",
  "credit_entry_sales",
  "store_credit_entries",
  "store_credit_synced_stores",
  "session_stores",
  "route_sessions",
  "province_stores",
  "stores",
  "provinces",
  "routes",
  "province_price_modifiers",
  "products",
  "outbox",
  "sync_state",
];

export function clearSessionData() {
  getDb().withTransactionSync(() => {
    for (const table of TABLES_IN_DELETE_ORDER) {
      getDb().runSync(`DELETE FROM ${table}`);
    }
  });
}
