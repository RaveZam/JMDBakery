// Shared setup for integration tests that exercise services against a real
// SQLite engine (backed by node:sqlite via __mocks__/expo-sqlite.js).
//
// Pattern: createSchema() once in beforeAll, resetDb() in beforeEach. The
// in-memory DB is shared across a file, so resetDb() wipes rows in FK-safe
// order to isolate each test. Parents are seeded straight through the DAOs
// (not the services) so seeding never touches the outbox — that keeps outbox
// assertions about only the action under test.
import { getDb, initDb } from "@/src/lib/db";
import RoutesDao from "@/src/lib/dao/routes-dao";
import ProvincesDao from "@/src/lib/dao/province-dao";
import StoresDao from "@/src/lib/dao/store-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import { ProductsDao } from "@/src/lib/dao/products-dao";

export type OutboxRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: "create" | "update" | "delete";
  payload: string;
  created_at: string;
  synced_at: string | null;
};

export async function createSchema(): Promise<void> {
  await initDb();
}

export function resetDb(): void {
  const db = getDb();
  // Children before parents — foreign_keys is ON in initDb().
  db.runSync("DELETE FROM outbox");
  db.runSync("DELETE FROM sales");
  db.runSync("DELETE FROM session_inventory");
  db.runSync("DELETE FROM ending_inventory");
  db.runSync("DELETE FROM session_stores");
  db.runSync("DELETE FROM products");
  db.runSync("DELETE FROM route_sessions");
  db.runSync("DELETE FROM stores");
  db.runSync("DELETE FROM provinces");
  db.runSync("DELETE FROM routes");
}

/** Insert a route directly (no outbox row) and return its id. */
export function seedRoute(name = "North Route"): string {
  return RoutesDao.insertRoute(name);
}

/** Insert a province under a route directly (no outbox row) and return its id. */
export function seedProvince(routeId: string, name = "Bulacan"): string {
  return ProvincesDao.insertProvince(routeId, name);
}

/** Insert a store under a province directly (no outbox row) and return its id. */
export function seedStore(provinceId: string, name = "Store A"): string {
  return StoresDao.insertStore({ provinceId, name, province: "", city: "", barangay: "" });
}

/** Insert a route session directly (no outbox row) and return its id. */
export function seedRouteSession(routeName = "North Route"): string {
  return RouteSessionsDao.insert({
    routeName,
    sessionDate: "2026-06-30",
    conductedBy: "user-1",
    createdAt: "2026-06-30T00:00:00.000Z",
  });
}

/** Insert a session store directly (no outbox row) and return its id. */
export function seedSessionStore(
  routeSessionId: string,
  storeId: string,
  provinceId?: string,
): string {
  return SessionStoresDao.insert({
    routeSessionId,
    storeId,
    provinceId: provinceId ?? null,
    createdAt: "2026-06-30T00:00:00.000Z",
  });
}

/** Insert a product directly (no outbox row) and return its id. */
export function seedProduct(id = "prod-1", name = "Pandesal", price = 10): string {
  ProductsDao.insertProduct(id, name, price);
  return id;
}

/** Pending outbox rows, optionally filtered by entity_type, oldest first. */
export function getOutbox(entityType?: string): OutboxRow[] {
  const db = getDb();
  if (entityType) {
    return db.getAllSync<OutboxRow>(
      "SELECT * FROM outbox WHERE entity_type = ? ORDER BY created_at",
      [entityType],
    );
  }
  return db.getAllSync<OutboxRow>("SELECT * FROM outbox ORDER BY created_at");
}

/**
 * The most recently enqueued outbox row for an entity id, payload parsed.
 * Latest-wins because an entity can accumulate rows (create then update/delete)
 * and a test asserts on the action it just performed. rowid is the reliable
 * insertion order (ISO created_at can tie within the same millisecond).
 */
export function latestOutboxFor(entityId: string): {
  entity_type: string;
  operation: string;
  payload: Record<string, unknown>;
} | null {
  const db = getDb();
  const row = db.getFirstSync<OutboxRow>(
    "SELECT * FROM outbox WHERE entity_id = ? ORDER BY rowid DESC",
    [entityId],
  );
  if (!row) return null;
  return {
    entity_type: row.entity_type,
    operation: row.operation,
    payload: JSON.parse(row.payload),
  };
}
