import { getDb } from "@/src/lib/db";

export function clearSessionData() {
  getDb().withTransactionSync(() => {
    getDb().runSync(`DELETE FROM sales`);
    getDb().runSync(`DELETE FROM session_stores`);
    getDb().runSync(`DELETE FROM route_sessions`);
    getDb().runSync(`DELETE FROM outbox`);
  });
}
