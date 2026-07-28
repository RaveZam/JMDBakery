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
      province_id TEXT NOT NULL REFERENCES provinces(id),
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      barangay TEXT NOT NULL,
      contact_number TEXT,
      contact_name TEXT
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
    CREATE INDEX IF NOT EXISTS session_stores_session_idx ON session_stores(route_session_id);
    CREATE INDEX IF NOT EXISTS sales_session_store_idx ON sales(session_store_id);
    CREATE INDEX IF NOT EXISTS session_inventory_session_idx ON session_inventory(route_session_id);
    CREATE INDEX IF NOT EXISTS ending_inventory_session_idx ON ending_inventory(route_session_id);
    CREATE INDEX IF NOT EXISTS outbox_pending_idx ON outbox(synced_at) WHERE synced_at IS NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_route_sessions_one_ongoing ON route_sessions(status) WHERE status = 'ongoing';
    CREATE INDEX IF NOT EXISTS route_sessions_created_at_idx ON route_sessions(created_at DESC);
  `);

  await runMigrations(database);
}

// Pricing reads snapshot_price alone, so rows loaded before the column existed
// would price at 0 — including sessions an agent is in the middle of running.
// Take the current product price as the best available stand-in; rows whose
// product is already gone stay NULL and fall back to 0 as before. Runs only on
// the launch that adds the column: later, a row is NULL because its product is
// gone, and stamping today's price on it would contradict "price at load time".
const BACKFILL_SNAPSHOT_PRICE = `
  UPDATE session_inventory
  SET snapshot_price = (
    SELECT price FROM products WHERE products.id = session_inventory.product_id
  )
  WHERE snapshot_price IS NULL
`;

/**
 * Columns added after the fact; SQLite has no "ADD COLUMN IF NOT EXISTS". The
 * optional second statement is a one-shot follow-up for the new column — it runs
 * on the launch that adds it and never again.
 */
const ADDED_COLUMNS: [addColumn: string, followUp?: string][] = [
  [`ALTER TABLE route_sessions ADD COLUMN morning_inventory_finished INTEGER NOT NULL DEFAULT 0`],
  [`ALTER TABLE route_sessions ADD COLUMN conducted_by_name TEXT`],
  [
    `ALTER TABLE session_inventory ADD COLUMN snapshot_price REAL`,
    BACKFILL_SNAPSHOT_PRICE,
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

  await dropSalesProductForeignKey(database);
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
    total            REAL GENERATED ALWAYS AS (snapshot_price * quantity_sold) VIRTUAL,
    created_at       TEXT NOT NULL
  )
`;

// total is generated — copy every column except that one.
const COPY_SALES_INTO_REBUILT = `
  INSERT INTO sales_rebuilt
    (id, session_store_id, product_id, snapshot_name, snapshot_price,
     quantity_sold, quantity_bo, bo_reason, created_at)
  SELECT id, session_store_id, product_id, snapshot_name, snapshot_price,
         quantity_sold, quantity_bo, bo_reason, created_at
  FROM sales
`;

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
  if (!foreignKeys.some((foreignKey) => foreignKey.table === "products")) return;

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
