// Covers downloadStoreCreditEntries specifically (see download-incremental.test.ts
// for the general incremental-pull behavior shared with products/price modifiers).
// Split into its own file because store credit needs a two-leg pull — backfill
// for a newly-linked store, then the shared incremental cursor — which needs
// asserting the .in() scoping the other pulls don't use.
import {
  createSchema,
  resetDb,
  seedProvince,
  seedRoute,
  seedStore,
} from "@/src/test-utils/db-test-helpers";
import StoreCreditDao from "@/src/lib/dao/store-credit-dao";
import CreditEntrySalesDao from "@/src/lib/dao/credit-entry-sales-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { runDownloadSync } from "@/src/lib/sync/download";

jest.mock("@/src/lib/network", () => ({
  isWifiConnected: jest.fn().mockResolvedValue(true),
}));

const mock = {
  rowsByTable: {} as Record<string, unknown[]>,
  gteCalls: [] as { table: string; column: string; value: string }[],
  inCalls: [] as { table: string; column: string; values: string[] }[],
};

type MockQueryResult = { data: unknown[] | null; error: null };
type MockBuilder = {
  select: () => MockBuilder;
  // downloadSessions (upstream of downloadStoreCreditEntries in runDownloadSync)
  // filters on .is("deleted_at", null); unused by these tests otherwise.
  is: () => Promise<MockQueryResult>;
  gte: (column: string, value: string) => MockBuilder;
  in: (column: string, values: string[]) => MockBuilder;
  then: (
    resolve: (value: MockQueryResult) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: jest.fn((table: string) => {
      const result: MockQueryResult = {
        data: mock.rowsByTable[table] ?? [],
        error: null,
      };
      const builder: MockBuilder = {
        select: () => builder,
        is: () => Promise.resolve(result),
        gte: (column, value) => {
          mock.gteCalls.push({ table, column, value });
          return builder;
        },
        in: (column, values) => {
          mock.inCalls.push({ table, column, values });
          return builder;
        },
        then: (resolve, reject) =>
          Promise.resolve(result).then(resolve, reject),
      };
      return builder;
    }),
  },
}));

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  mock.rowsByTable = {};
  mock.gteCalls = [];
  mock.inCalls = [];
});

function seedLocalStore(): string {
  return seedStore(seedProvince(seedRoute()));
}

function creditRowFor(storeId: string) {
  return {
    id: "credit-1",
    store_id: storeId,
    session_store_id: null,
    entry_type: "credit",
    amount: 400,
    note: null,
    recorded_by: "user-2",
    recorded_by_name: "Agent Two",
    created_at: "2026-07-29T08:00:00+00:00",
    deleted_at: null,
    updated_at: "2026-07-29T08:00:00+00:00",
  };
}

test("a store with no local id yet is never queried", async () => {
  await runDownloadSync();

  expect(
    mock.inCalls.some((call) => call.table === "store_credit_entries"),
  ).toBe(false);
});

test("first run backfills a store's full history unfiltered by updated_at and advances the cursor", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [creditRowFor(storeId)];

  await runDownloadSync();

  const entries = StoreCreditDao.getByStoreId(storeId);
  expect(entries).toHaveLength(1);
  expect(entries[0].amount).toBe(400);
  expect(entries[0].recorded_by_name).toBe("Agent Two");
  expect(SyncStateDao.getLastSyncedAt("store_credit_entries")).toBe(
    "2026-07-29T08:00:00+00:00",
  );
});

test("re-applying an entry the device already has is a no-op, not a collision", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [creditRowFor(storeId)];
  await runDownloadSync();
  await runDownloadSync();

  expect(StoreCreditDao.getByStoreId(storeId)).toHaveLength(1);
});

// A settled or mistaken debt has to actually leave other agents' phones.
test("an arriving deleted_at removes the entry locally", async () => {
  const storeId = seedLocalStore();
  const creditRow = creditRowFor(storeId);
  mock.rowsByTable.store_credit_entries = [creditRow];
  await runDownloadSync();

  mock.rowsByTable.store_credit_entries = [
    {
      ...creditRow,
      deleted_at: "2026-07-29T09:00:00+00:00",
      updated_at: "2026-07-29T09:00:00+00:00",
    },
  ];
  await runDownloadSync();

  expect(StoreCreditDao.getByStoreId(storeId)).toHaveLength(0);
});

test("sends the stored cursor as gte on the next pull", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [creditRowFor(storeId)];
  await runDownloadSync();

  mock.gteCalls.length = 0;
  await runDownloadSync();

  expect(mock.gteCalls).toContainEqual({
    table: "store_credit_entries",
    column: "updated_at",
    value: "2026-07-29T08:00:00+00:00",
  });
});

test("a newly-linked store is backfilled unfiltered on the run it first appears", async () => {
  const firstStoreId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [creditRowFor(firstStoreId)];
  await runDownloadSync();

  const secondStoreId = seedLocalStore();
  mock.gteCalls.length = 0;
  mock.inCalls.length = 0;
  await runDownloadSync();

  // getAllStoreIds() has no defined order, so compare sets, not arrays.
  const storeIdSetsQueried = mock.inCalls
    .filter((call) => call.table === "store_credit_entries")
    .map((call) => [...call.values].sort());

  // Backfill leg: only the never-synced store, no updated_at filter.
  expect(storeIdSetsQueried).toContainEqual([secondStoreId]);
  // Incremental leg: every known store, filtered by the shared cursor.
  expect(storeIdSetsQueried).toContainEqual(
    [firstStoreId, secondStoreId].sort(),
  );
  expect(mock.gteCalls).toContainEqual({
    table: "store_credit_entries",
    column: "updated_at",
    value: "2026-07-29T08:00:00+00:00",
  });
});

// The visit behind a credit taken on another agent's device isn't on this
// phone, so its items have to come down with the entry — into
// credit_entry_sales, never into sales, which stock math reads.
test("pulls the sale lines of a credit whose visit this device doesn't have", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [
    { ...creditRowFor(storeId), session_store_id: "session-store-elsewhere" },
  ];
  mock.rowsByTable.sales = [
    {
      id: "sale-1",
      session_store_id: "session-store-elsewhere",
      product_id: "prod-1",
      snapshot_product_name: "Ensaymada",
      snapshot_price: 15,
      quantity_sold: 4,
      quantity_bo: 1,
      bo_reason: "Damaged",
      created_at: "2026-07-29T08:00:00+00:00",
    },
  ];

  await runDownloadSync();

  expect(mock.inCalls).toContainEqual({
    table: "sales",
    column: "session_store_id",
    values: ["session-store-elsewhere"],
  });
  const items = CreditEntrySalesDao.getBySessionStoreId(
    "session-store-elsewhere",
  );
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({ productName: "Ensaymada", qty: 4 });
});

test("a visit whose items are already down is not pulled again", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [
    { ...creditRowFor(storeId), session_store_id: "session-store-elsewhere" },
  ];
  mock.rowsByTable.sales = [
    {
      id: "sale-1",
      session_store_id: "session-store-elsewhere",
      product_id: "prod-1",
      snapshot_product_name: "Ensaymada",
      snapshot_price: 15,
      quantity_sold: 4,
      quantity_bo: 0,
      bo_reason: null,
      created_at: "2026-07-29T08:00:00+00:00",
    },
  ];
  await runDownloadSync();

  mock.inCalls.length = 0;
  await runDownloadSync();

  expect(mock.inCalls.some((call) => call.table === "sales")).toBe(false);
});

test("an entry with no visit behind it queries no sales at all", async () => {
  const storeId = seedLocalStore();
  mock.rowsByTable.store_credit_entries = [creditRowFor(storeId)];

  await runDownloadSync();

  expect(mock.inCalls.some((call) => call.table === "sales")).toBe(false);
});
