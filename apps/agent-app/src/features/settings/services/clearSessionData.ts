import { getDb } from "@/src/lib/db";

// Child tables first so foreign keys stay satisfied inside the transaction.
// Auth lives in expo-sqlite/localStorage, not this database, so it survives.
const TABLES_IN_DELETE_ORDER = [
  "sales",
  "ending_inventory",
  "session_inventory",
  "session_stores",
  "route_sessions",
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
