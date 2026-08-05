import {
  createSchema,
  resetDb,
  seedProduct,
  seedProvince,
  seedRoute,
  seedRouteSession,
  seedSessionStore,
  seedStore,
} from "@/src/test-utils/db-test-helpers";
import { getDb, initDb } from "@/src/lib/db";
import SalesDao from "@/src/lib/dao/sales-dao";
import { generateUUID } from "@/src/lib/uuid";

function insertSession(status: string): string {
  const id = generateUUID();
  getDb().runSync(
    `INSERT INTO route_sessions (id, route_name, session_date, conducted_by, status, created_at)
     VALUES (?, 'R', '2026-07-06', 'user-1', ?, '2026-07-06T00:00:00Z')`,
    [id, status],
  );
  return id;
}

/** Puts back the pre-migration sales table, FK to products included. */
function restoreLegacySalesTable(): void {
  getDb().runSync("DROP TABLE sales");
  getDb().runSync(`
    CREATE TABLE sales (
      id               TEXT PRIMARY KEY,
      session_store_id TEXT NOT NULL REFERENCES session_stores(id),
      product_id       TEXT NOT NULL REFERENCES products(id),
      snapshot_name    TEXT NOT NULL,
      snapshot_price   REAL NOT NULL,
      quantity_sold    INTEGER NOT NULL DEFAULT 0,
      quantity_bo      INTEGER NOT NULL DEFAULT 0,
      bo_reason        TEXT,
      total            REAL GENERATED ALWAYS AS (snapshot_price * quantity_sold) VIRTUAL,
      created_at       TEXT NOT NULL
    )
  `);
}

/**
 * Puts back the pre-migration session_inventory table — no snapshot_price — so
 * the ALTER actually fires and its one-shot backfill runs with it.
 */
function restoreLegacySessionInventoryTable(): void {
  getDb().runSync("DROP TABLE session_inventory");
  getDb().runSync(`
    CREATE TABLE session_inventory (
      id                    TEXT PRIMARY KEY,
      route_session_id      TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      quantity              INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL,
      UNIQUE(route_session_id, product_id)
    )
  `);
}

function seedLegacySale(): void {
  const sessionStoreId = seedSessionStore(
    seedRouteSession(),
    seedStore(seedProvince(seedRoute())),
  );
  seedProduct("prod-legacy", "Ensaymada", 15);
  // Raw insert, not SalesDao: the legacy table predates payment_type, so the
  // current DAO's column list wouldn't fit it.
  getDb().runSync(
    `INSERT INTO sales (id, session_store_id, product_id, snapshot_name,
                        snapshot_price, quantity_sold, quantity_bo, bo_reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "sale-legacy",
      sessionStoreId,
      "prod-legacy",
      "Ensaymada",
      15,
      3,
      0,
      "",
      "2026-07-27T11:00:00.000Z",
    ],
  );
}

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

test("allows the 'cancelled' status value", () => {
  const id = insertSession("cancelled");
  const row = getDb().getFirstSync<{ status: string }>(
    "SELECT status FROM route_sessions WHERE id = ?",
    [id],
  );
  expect(row?.status).toBe("cancelled");
});

test("rejects a second ongoing session via the unique index", () => {
  insertSession("ongoing");
  expect(() => insertSession("ongoing")).toThrow();
});

test("allows a new ongoing session once the previous is cancelled", () => {
  const first = insertSession("ongoing");
  getDb().runSync(
    "UPDATE route_sessions SET status = 'cancelled' WHERE id = ?",
    [first],
  );
  expect(() => insertSession("ongoing")).not.toThrow();
});

test("sales has no foreign key to products, so a sold product stays deletable", () => {
  const foreignKeys = getDb().getAllSync<{ table: string }>(
    "PRAGMA foreign_key_list(sales)",
  );
  expect(foreignKeys.map((foreignKey) => foreignKey.table)).toEqual([
    "session_stores",
  ]);
});

test("rebuilding sales drops the old products FK and keeps the rows", async () => {
  restoreLegacySalesTable();
  seedLegacySale();

  await initDb();

  expect(
    getDb()
      .getAllSync<{ table: string }>("PRAGMA foreign_key_list(sales)")
      .map((foreignKey) => foreignKey.table),
  ).toEqual(["session_stores"]);
  // Rows survive the rebuild, generated column included.
  expect(
    getDb().getFirstSync<{ total: number }>(
      "SELECT total FROM sales WHERE id = 'sale-legacy'",
    )?.total,
  ).toBe(45);
  // The rebuild runs after the ADDED_COLUMNS block, so it has to carry
  // payment_type across rather than recreate the table without it. A sale
  // predating the column is cash, which is what it always meant.
  expect(
    getDb().getFirstSync<{ payment_type: string }>(
      "SELECT payment_type FROM sales WHERE id = 'sale-legacy'",
    )?.payment_type,
  ).toBe("cash");
  // And the product it points at is now deletable.
  expect(() =>
    getDb().runSync("DELETE FROM products WHERE id = 'prod-legacy'"),
  ).not.toThrow();
});

test("drops session_stores.payment_type, keeping the visits themselves", async () => {
  // An install from when the visit carried the payment type. It can't say that
  // a stop took some goods on credit and was paid cash for the rest, so sales
  // owns that now and this column goes.
  getDb().runSync(
    `ALTER TABLE session_stores ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'cash'`,
  );
  const sessionStoreId = seedSessionStore(
    seedRouteSession(),
    seedStore(seedProvince(seedRoute())),
  );

  await initDb();

  const columns = getDb()
    .getAllSync<{ name: string }>("PRAGMA table_info(session_stores)")
    .map((column) => column.name);
  expect(columns).not.toContain("payment_type");
  expect(
    getDb().getFirstSync<{ id: string }>(
      "SELECT id FROM session_stores WHERE id = ?",
      [sessionStoreId],
    )?.id,
  ).toBe(sessionStoreId);
});

test("backfills snapshot_price on inventory rows written before the column", async () => {
  const sessionId = seedRouteSession();
  seedProduct("prod-priced", "Ensaymada", 15);
  restoreLegacySessionInventoryTable();
  getDb().runSync(
    `INSERT INTO session_inventory
       (id, route_session_id, product_id, snapshot_product_name, quantity, created_at)
     VALUES ('inv-legacy', ?, 'prod-priced', 'Ensaymada', 4, '2026-07-27T00:00:00Z')`,
    [sessionId],
  );

  await initDb();

  expect(
    getDb().getFirstSync<{ snapshot_price: number | null }>(
      "SELECT snapshot_price FROM session_inventory WHERE id = 'inv-legacy'",
    )?.snapshot_price,
  ).toBe(15);
});

test("leaves snapshot_price null when the product is already gone", async () => {
  const sessionId = seedRouteSession();
  restoreLegacySessionInventoryTable();
  getDb().runSync(
    `INSERT INTO session_inventory
       (id, route_session_id, product_id, snapshot_product_name, quantity, created_at)
     VALUES ('inv-orphan', ?, 'prod-deleted', 'Ensaymada', 4, '2026-07-27T00:00:00Z')`,
    [sessionId],
  );

  await initDb();

  expect(
    getDb().getFirstSync<{ snapshot_price: number | null }>(
      "SELECT snapshot_price FROM session_inventory WHERE id = 'inv-orphan'",
    )?.snapshot_price,
  ).toBeNull();
});

// A NULL price on a later launch means the product is gone, not that the
// migration is pending — stamping today's price on it would contradict
// "price at load time".
test("does not re-run the backfill once the column exists", async () => {
  const sessionId = seedRouteSession();
  seedProduct("prod-priced", "Ensaymada", 15);
  getDb().runSync(
    `INSERT INTO session_inventory
       (id, route_session_id, product_id, snapshot_product_name, quantity, created_at)
     VALUES ('inv-null', ?, 'prod-priced', 'Ensaymada', 4, '2026-07-27T00:00:00Z')`,
    [sessionId],
  );

  await initDb();

  expect(
    getDb().getFirstSync<{ snapshot_price: number | null }>(
      "SELECT snapshot_price FROM session_inventory WHERE id = 'inv-null'",
    )?.snapshot_price,
  ).toBeNull();
});

test("route_sessions has conducted_by_name column", () => {
  const cols = getDb().getAllSync<{ name: string }>(
    "PRAGMA table_info(route_sessions)",
  );
  expect(cols.map((c) => c.name)).toContain("conducted_by_name");
});
