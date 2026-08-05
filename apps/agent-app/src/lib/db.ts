import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("routeledger-v6.db");
  }
  return db;
}

export async function initDb(): Promise<void> {
  const database = getDb();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS provinces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      route_id TEXT NOT NULL REFERENCES routes(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      province_id TEXT,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      barangay TEXT NOT NULL,
      contact_number TEXT,
      contact_name TEXT,
      created_by TEXT,
      created_by_name TEXT
    );
    
    CREATE TABLE IF NOT EXISTS province_stores (
      id          TEXT PRIMARY KEY,
      province_id TEXT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
      store_id    TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL,
      UNIQUE(province_id, store_id)
    );

    CREATE TABLE IF NOT EXISTS route_sessions (
      id                          TEXT PRIMARY KEY,
      route_name                  TEXT NOT NULL,
      session_date                TEXT NOT NULL,
      conducted_by                TEXT NOT NULL,
      conducted_by_name           TEXT,
      status                      TEXT NOT NULL DEFAULT 'ongoing' CHECK(status IN ('ongoing', 'completed', 'cancelled')),
      morning_inventory_finished  INTEGER NOT NULL DEFAULT 0,
      created_at                  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_stores (
      id               TEXT PRIMARY KEY,
      route_session_id TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      store_id         TEXT NOT NULL,
      province_id      TEXT,
      visited          INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL,
      UNIQUE(route_session_id, store_id)
    );

    -- No deleted_at here: the server soft-deletes so the change can travel in an
    -- incremental pull, but locally the row is simply removed on arrival.
    CREATE TABLE IF NOT EXISTS products (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS province_price_modifiers (
      id               TEXT PRIMARY KEY,
      product_id       TEXT NOT NULL,
      province_keyword TEXT NOT NULL,
      price_modifier   REAL NOT NULL
    );

    -- One row per server table we pull incrementally, holding the newest
    -- updated_at we've already applied. See src/lib/sync/download.ts.
    CREATE TABLE IF NOT EXISTS sync_state (
      table_name     TEXT PRIMARY KEY,
      last_synced_at TEXT NOT NULL
    );

    -- Small facts about this install that outlive a launch. Holds the signed-in
    -- agent's id so a sync read can answer "is this store mine" before
    -- supabase.auth.getSession() has resolved.
    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS sales (
      id               TEXT PRIMARY KEY,
      session_store_id TEXT NOT NULL REFERENCES session_stores(id),
      -- No FK to products: a product deleted on the server has to be removable
      -- locally, and nothing joins products — history renders from the
      -- snapshot_name / snapshot_price columns below.
      product_id       TEXT NOT NULL,
      snapshot_name    TEXT NOT NULL,
      snapshot_price   REAL NOT NULL,
      quantity_sold    INTEGER NOT NULL DEFAULT 0,
      quantity_bo      INTEGER NOT NULL DEFAULT 0,
      bo_reason        TEXT,
      total            REAL GENERATED ALWAYS AS (snapshot_price * quantity_sold) VIRTUAL,
      created_at       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_inventory (
      id                    TEXT PRIMARY KEY,
      route_session_id      TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      -- Price at load time, and the only price a running session uses: products
      -- is never consulted, so a mid-session price change doesn't apply and a
      -- product deleted mid-session still prices. NULL only on rows written
      -- before this column existed whose product was already gone.
      snapshot_price        REAL,
      quantity              INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL,
      UNIQUE(route_session_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS ending_inventory (
      id                    TEXT PRIMARY KEY,
      route_session_id      TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      quantity              INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL,
      UNIQUE(route_session_id, product_id)
    );

    -- No FK on store_id/session_store_id, same reasoning as sales.product_id:
    -- session_stores cascade-deletes with its route_sessions, and a cancelled
    -- or deleted session must not silently erase a debt the store still owes.
    -- Both are grouping keys only. No local deleted_at — an arriving
    -- deleted_at deletes the row, matching products.
    CREATE TABLE IF NOT EXISTS store_credit_entries (
      id               TEXT PRIMARY KEY,
      store_id         TEXT NOT NULL,
      session_store_id TEXT,
      entry_type       TEXT NOT NULL CHECK(entry_type IN ('credit','payment')),
      amount           REAL NOT NULL,
      note             TEXT,
      recorded_by      TEXT NOT NULL,
      recorded_by_name TEXT,
      created_at       TEXT NOT NULL
    );

    -- Stores whose full credit history has already been pulled once. Without
    -- this a store linked to the agent after the cursor moved on would only
    -- ever receive entries newer than the cursor, and its balance would
    -- render short. See src/lib/sync/download.ts.
    CREATE TABLE IF NOT EXISTS store_credit_synced_stores (
      store_id TEXT PRIMARY KEY
    );

    -- Sale lines behind a credit entry recorded on a visit this device
    -- doesn't have locally (another agent's session_stores row). Kept
    -- separate from sales, which stock math reads — these lines belong to
    -- a visit this device never ran and must not affect its own stock count.
    -- No FK to session_stores: that row deliberately never arrives here.
    CREATE TABLE IF NOT EXISTS credit_entry_sales (
      id                    TEXT PRIMARY KEY,
      session_store_id      TEXT NOT NULL,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      snapshot_price        REAL NOT NULL,
      quantity_sold         INTEGER NOT NULL DEFAULT 0,
      quantity_bo           INTEGER NOT NULL DEFAULT 0,
      bo_reason             TEXT,
      created_at            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id          TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id   TEXT NOT NULL,
      operation   TEXT NOT NULL CHECK(operation IN ('create', 'update', 'delete')),
      payload     TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      synced_at   TEXT
    );

    -- Indexes for hot paths
    CREATE INDEX IF NOT EXISTS provinces_route_id_idx ON provinces(route_id);
    CREATE INDEX IF NOT EXISTS stores_province_id_idx ON stores(province_id);
    CREATE INDEX IF NOT EXISTS province_stores_province_idx ON province_stores(province_id);
    CREATE INDEX IF NOT EXISTS province_stores_store_idx ON province_stores(store_id);
    CREATE INDEX IF NOT EXISTS session_stores_session_idx ON session_stores(route_session_id);
    CREATE INDEX IF NOT EXISTS sales_session_store_idx ON sales(session_store_id);
    CREATE INDEX IF NOT EXISTS session_inventory_session_idx ON session_inventory(route_session_id);
    CREATE INDEX IF NOT EXISTS ending_inventory_session_idx ON ending_inventory(route_session_id);
    CREATE INDEX IF NOT EXISTS outbox_pending_idx ON outbox(synced_at) WHERE synced_at IS NULL;
    CREATE INDEX IF NOT EXISTS store_credit_entries_store_idx ON store_credit_entries(store_id);
    CREATE UNIQUE INDEX IF NOT EXISTS store_credit_entries_session_store_idx
      ON store_credit_entries(session_store_id) WHERE session_store_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS credit_entry_sales_session_store_idx ON credit_entry_sales(session_store_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_route_sessions_one_ongoing ON route_sessions(status) WHERE status = 'ongoing';
    CREATE INDEX IF NOT EXISTS route_sessions_created_at_idx ON route_sessions(created_at DESC);
  `);

  await runMigrations(database);
}

const BACKFILL_SNAPSHOT_PRICE = `
  UPDATE session_inventory
  SET snapshot_price = (
    SELECT price FROM products WHERE products.id = session_inventory.product_id
  )
  WHERE snapshot_price IS NULL
`;

const BACKFILL_PROVINCE_STORES = `
  INSERT OR IGNORE INTO province_stores (id, province_id, store_id, created_at)
  SELECT lower(hex(randomblob(16))), province_id, id, datetime('now')
  FROM stores
  WHERE province_id IS NOT NULL
`;

const ADDED_COLUMNS: [addColumn: string, followUp?: string][] = [
  [
    `ALTER TABLE route_sessions ADD COLUMN morning_inventory_finished INTEGER NOT NULL DEFAULT 0`,
  ],
  [`ALTER TABLE route_sessions ADD COLUMN conducted_by_name TEXT`],
  [
    `ALTER TABLE session_inventory ADD COLUMN snapshot_price REAL`,
    BACKFILL_SNAPSHOT_PRICE,
  ],
  [`ALTER TABLE stores ADD COLUMN created_by TEXT`, BACKFILL_PROVINCE_STORES],
  [`ALTER TABLE stores ADD COLUMN created_by_name TEXT`],
  // How each order was settled. One stop can mix the two — a store takes some
  // goods on credit and pays cash for the rest — so this sits on the order, not
  // on the visit. 'cash' by default, which is what every sale before this
  // column meant.
  [`ALTER TABLE sales ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'cash'`],
  [
    `ALTER TABLE credit_entry_sales ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'cash'`,
  ],
];

/** Brings an existing install up to the schema `initDb()` just declared. */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  for (const [addColumn, followUp] of ADDED_COLUMNS) {
    try {
      database.runSync(addColumn);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Only "already there" is expected; anything else is a real failure and
      // must not be mistaken for a completed migration.
      if (!message.includes("duplicate column name")) {
        throw new Error(`Migration failed: ${addColumn} — ${message}`);
      }
      continue; // column exists, so its follow-up already ran
    }
    if (followUp) database.runSync(followUp);
  }

  dropSessionStorePaymentType(database);
  await dropSalesProductForeignKey(database);
  await dropStoreProvinceForeignKey(database);
}

// Carries the old per-visit answer down onto the orders. The ADDED_COLUMNS
// block defaulted every existing sale to 'cash', so a visit settled on credit
// back when the visit held the flag has no credit sale lines under it. Its debt
// survives as a store_credit_entries row, but the moment an agent edits one of
// those orders the debt is re-derived from the sales — and would come out as
// zero, silently wiping what the store owes.
const BACKFILL_SALE_PAYMENT_TYPE = `
  UPDATE sales SET payment_type = 'credit'
  WHERE session_store_id IN (
    SELECT id FROM session_stores WHERE payment_type = 'credit'
  )
`;

/**
 * Drops `session_stores.payment_type` on installs that still carry it. How an
 * order is settled belongs to the order — a stop can take some goods on credit
 * and pay cash for the rest, which one column on the visit can't say. `sales`
 * answers it now, and leaving this one behind would leave a second, wrong
 * answer sitting next to the right one.
 *
 * Mirrors `20260805000000_move_payment_type_to_sales.sql`, which does the same
 * backfill-then-drop on the server.
 */
function dropSessionStorePaymentType(database: SQLite.SQLiteDatabase): void {
  const columns = database.getAllSync<{ name: string }>(
    `PRAGMA table_info(session_stores)`,
  );
  if (!columns.some((column) => column.name === "payment_type")) return;

  database.runSync(BACKFILL_SALE_PAYMENT_TYPE);
  database.runSync(`ALTER TABLE session_stores DROP COLUMN payment_type`);
}

const CREATE_SALES_REBUILT = `
  CREATE TABLE sales_rebuilt (
    id               TEXT PRIMARY KEY,
    session_store_id TEXT NOT NULL REFERENCES session_stores(id),
    product_id       TEXT NOT NULL,
    snapshot_name    TEXT NOT NULL,
    snapshot_price   REAL NOT NULL,
    quantity_sold    INTEGER NOT NULL DEFAULT 0,
    quantity_bo      INTEGER NOT NULL DEFAULT 0,
    bo_reason        TEXT,
    payment_type     TEXT NOT NULL DEFAULT 'cash',
    total            REAL GENERATED ALWAYS AS (snapshot_price * quantity_sold) VIRTUAL,
    created_at       TEXT NOT NULL
  )
`;

// total is generated — copy every column except that one. This runs after the
// ADDED_COLUMNS block, so payment_type is already on the old table and has to
// be carried across, or the rebuild would silently drop it.
const COPY_SALES_INTO_REBUILT = `
  INSERT INTO sales_rebuilt
    (id, session_store_id, product_id, snapshot_name, snapshot_price,
     quantity_sold, quantity_bo, bo_reason, payment_type, created_at)
  SELECT id, session_store_id, product_id, snapshot_name, snapshot_price,
         quantity_sold, quantity_bo, bo_reason, payment_type, created_at
  FROM sales
`;

const CREATE_STORES_REBUILT = `
  CREATE TABLE stores_rebuilt (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    province_id TEXT,
    province TEXT NOT NULL,
    city TEXT NOT NULL,
    barangay TEXT NOT NULL,
    contact_number TEXT,
    contact_name TEXT,
    created_by TEXT,
    created_by_name TEXT
  )
`;

const COPY_STORES_INTO_REBUILT = `
  INSERT INTO stores_rebuilt
    (id, name, province_id, province, city, barangay, contact_number,
     contact_name, created_by, created_by_name)
  SELECT id, name, province_id, province, city, barangay, contact_number,
         contact_name, created_by, created_by_name
  FROM stores
`;

/**
 * Drops `stores.province_id NOT NULL REFERENCES provinces(id)` on installs that
 * still carry it. A store registered by another agent arrives pointing at one of
 * *their* provinces, which this device has no row for, so the constraint would
 * reject the row outright. province_id survives as plain attribution — reads go
 * through province_stores now. Rebuilt in place rather than by bumping the DB
 * filename, which would take in-flight sessions and unpushed outbox rows with it.
 */
async function dropStoreProvinceForeignKey(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  const foreignKeys = database.getAllSync<{ table: string }>(
    `PRAGMA foreign_key_list(stores)`,
  );
  if (!foreignKeys.some((foreignKey) => foreignKey.table === "provinces"))
    return;

  await database.execAsync(`PRAGMA foreign_keys = OFF`);
  try {
    database.withTransactionSync(() => {
      database.runSync(CREATE_STORES_REBUILT);
      database.runSync(COPY_STORES_INTO_REBUILT);
      database.runSync(`DROP TABLE stores`);
      database.runSync(`ALTER TABLE stores_rebuilt RENAME TO stores`);
      database.runSync(
        `CREATE INDEX IF NOT EXISTS stores_province_id_idx ON stores(province_id)`,
      );
    });
  } finally {
    await database.execAsync(`PRAGMA foreign_keys = ON`);
  }
}

/**
 * Drops the old `sales.product_id REFERENCES products(id)` constraint on
 * installs that still carry it. SQLite has no "ALTER TABLE DROP CONSTRAINT", so
 * the table has to be rebuilt — done in place rather than by bumping the DB
 * filename, which would take agents' in-flight sessions and unpushed outbox
 * rows with it.
 */
async function dropSalesProductForeignKey(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  const foreignKeys = database.getAllSync<{ table: string }>(
    `PRAGMA foreign_key_list(sales)`,
  );
  if (!foreignKeys.some((foreignKey) => foreignKey.table === "products"))
    return;

  // foreign_keys can only be toggled outside a transaction — inside one it is a
  // silent no-op, and the DROP TABLE below would then cascade or fail.
  await database.execAsync(`PRAGMA foreign_keys = OFF`);
  try {
    database.withTransactionSync(() => {
      database.runSync(CREATE_SALES_REBUILT);
      database.runSync(COPY_SALES_INTO_REBUILT);
      database.runSync(`DROP TABLE sales`);
      database.runSync(`ALTER TABLE sales_rebuilt RENAME TO sales`);
      // The index died with the old table.
      database.runSync(
        `CREATE INDEX IF NOT EXISTS sales_session_store_idx ON sales(session_store_id)`,
      );
    });
  } finally {
    await database.execAsync(`PRAGMA foreign_keys = ON`);
  }
}
