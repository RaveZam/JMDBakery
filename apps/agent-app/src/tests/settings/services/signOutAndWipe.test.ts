import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { supabase } from "@/src/lib/supabase";
import { SettingsDao } from "@/src/lib/dao/settings-dao";
import { signOutAndWipe } from "@/src/features/settings/services/signOutAndWipe";

jest.mock("@/src/lib/supabase", () => ({
  supabase: { auth: { signOut: jest.fn().mockResolvedValue({ error: null }) } },
}));

const mockSignOut = jest.mocked(supabase.auth.signOut);

/** Puts a row in every table the wipe is supposed to clear. */
function seedEverything(): void {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const db = getDb();
  db.runSync(
    `INSERT INTO store_credit_entries (id, store_id, entry_type, amount, recorded_by, created_at)
     VALUES ('credit-1', ?, 'credit', 100, 'user-1', '2026-06-30T00:00:00.000Z')`,
    [storeId],
  );
  db.runSync("INSERT INTO store_credit_synced_stores (store_id) VALUES (?)", [storeId]);
  db.runSync(
    `INSERT INTO credit_entry_sales
       (id, session_store_id, product_id, snapshot_product_name, snapshot_price, created_at)
     VALUES ('cline-1', 'ss-1', 'prod-1', 'Pandesal', 5, '2026-06-30T00:00:00.000Z')`,
  );
  db.runSync(
    `INSERT INTO outbox (id, entity_type, entity_id, operation, payload, created_at, synced_at)
     VALUES ('ob-1', 'sale', 'sale-1', 'create', '{}', '2026-06-30T00:00:00.000Z', NULL)`,
  );
  db.runSync(
    "INSERT INTO sync_state (table_name, last_synced_at) VALUES ('products', '2026-06-30T00:00:00.000Z')",
  );
}

const WIPED_TABLES = [
  "routes",
  "provinces",
  "stores",
  "province_stores",
  "route_sessions",
  "session_stores",
  "products",
  "province_price_modifiers",
  "sales",
  "session_inventory",
  "ending_inventory",
  "store_credit_entries",
  "store_credit_synced_stores",
  "credit_entry_sales",
  "outbox",
  "sync_state",
];

function countRows(table: string): number {
  return getDb().getFirstSync<{ n: number }>(`SELECT count(*) AS n FROM ${table}`)!.n;
}

beforeAll(async () => { await createSchema(); });
beforeEach(() => {
  jest.clearAllMocks();
  mockSignOut.mockResolvedValue({ error: null } as never);
  resetDb();
});

test("empties every local table", async () => {
  seedEverything();

  await signOutAndWipe();

  for (const table of WIPED_TABLES) {
    expect({ table, rows: countRows(table) }).toEqual({ table, rows: 0 });
  }
});

test("ends the Supabase session and drops device trust", async () => {
  SettingsDao.set("last_verified_session_at", "2026-06-30T00:00:00.000Z");

  await signOutAndWipe();

  expect(mockSignOut).toHaveBeenCalled();
  expect(SettingsDao.get("last_verified_session_at")).toBeNull();
});

test("leaves local data alone when signing out fails", async () => {
  mockSignOut.mockRejectedValue(new Error("network down"));
  seedEverything();

  await expect(signOutAndWipe()).rejects.toThrow("network down");

  expect(countRows("routes")).toBe(1);
  expect(countRows("outbox")).toBe(1);
});
