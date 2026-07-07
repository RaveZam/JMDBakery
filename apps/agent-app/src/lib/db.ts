import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("routeledger-v5.db");
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
      status                      TEXT NOT NULL DEFAULT 'ongoing' CHECK(status IN ('ongoing', 'completed', 'cancelled')),
      morning_inventory_finished  INTEGER NOT NULL DEFAULT 0,
      created_at                  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session_stores (
      id               TEXT PRIMARY KEY,
      route_session_id TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      store_id         TEXT NOT NULL,
      province_id      TEXT,
      visited          INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(route_session_id, store_id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id               TEXT PRIMARY KEY,
      session_store_id TEXT NOT NULL REFERENCES session_stores(id),
      product_id       TEXT NOT NULL REFERENCES products(id),
      snapshot_name    TEXT NOT NULL,
      snapshot_price   REAL NOT NULL,
      quantity_sold    INTEGER NOT NULL DEFAULT 0,
      quantity_bo      INTEGER NOT NULL DEFAULT 0,
      bo_reason        TEXT,
      total            REAL GENERATED ALWAYS AS (snapshot_price * quantity_sold) VIRTUAL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS session_inventory (
      id                    TEXT PRIMARY KEY,
      route_session_id      TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      quantity              INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(route_session_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS ending_inventory (
      id                    TEXT PRIMARY KEY,
      route_session_id      TEXT NOT NULL REFERENCES route_sessions(id) ON DELETE CASCADE,
      product_id            TEXT NOT NULL,
      snapshot_product_name TEXT NOT NULL,
      quantity              INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL DEFAULT (datetime('now')),
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
  `);

  // Column-level migrations for existing installs
  try {
    database.runSync(
      `ALTER TABLE route_sessions ADD COLUMN morning_inventory_finished INTEGER NOT NULL DEFAULT 0`,
    );
  } catch {
    // column already exists — safe to ignore
  }
}
