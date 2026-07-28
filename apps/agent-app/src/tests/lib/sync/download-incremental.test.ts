import {
  createSchema,
  resetDb,
  seedProvince,
  seedRoute,
  seedRouteSession,
  seedSessionStore,
  seedStore,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import { ProvincePriceModifiersDao } from "@/src/lib/dao/province-price-modifiers-dao";
import SalesDao from "@/src/lib/dao/sales-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { runDownloadSync } from "@/src/lib/sync/download";

jest.mock("@/src/lib/network", () => ({
  isWifiConnected: jest.fn().mockResolvedValue(true),
}));

// Per-test knobs for the Supabase mock below.
const mock = {
  rowsByTable: {} as Record<string, unknown[]>,
  errorByTable: {} as Record<string, { message: string }>,
  gteCalls: [] as { table: string; column: string; value: string }[],
};

// Minimal stand-in for the PostgREST query builder: chainable, and awaitable at
// any point in the chain. gte() records what it was handed so tests can assert
// the cursor actually reached the server.
// These two must be named with a `mock` prefix: jest hoists the factory below
// above them, and its out-of-scope guard treats a type alias like a variable.
type MockQueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};
type MockBuilder = {
  select: () => MockBuilder;
  is: () => Promise<MockQueryResult>;
  gte: (column: string, value: string) => MockBuilder;
  then: (
    resolve: (value: MockQueryResult) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: jest.fn((table: string) => {
      const result: MockQueryResult = {
        data: mock.errorByTable[table] ? null : (mock.rowsByTable[table] ?? []),
        error: mock.errorByTable[table] ?? null,
      };
      const builder: MockBuilder = {
        select: () => builder,
        is: () => Promise.resolve(result),
        gte: (column, value) => {
          mock.gteCalls.push({ table, column, value });
          return builder;
        },
        then: (resolve, reject) =>
          Promise.resolve(result).then(resolve, reject),
      };
      return builder;
    }),
  },
}));

const productRow = {
  id: "prod-1",
  product_name: "Pandesal",
  product_price: 10,
  deleted_at: null,
  updated_at: "2026-07-27T10:00:00+00:00",
};

const deletedProductRow = {
  ...productRow,
  deleted_at: "2026-07-27T13:00:00+00:00",
  updated_at: "2026-07-27T13:00:00+00:00",
};

function countProductRows(): number {
  return (
    getDb().getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM products",
    )?.count ?? 0
  );
}

let seededSessionStoreId = "";

/** A sale pointing at a product, to prove the delete isn't blocked by one. */
function seedSaleFor(productId: string): void {
  seededSessionStoreId = seedSessionStore(
    seedRouteSession(),
    seedStore(seedProvince(seedRoute())),
  );
  SalesDao.insertSale({
    id: "sale-1",
    sessionStoreId: seededSessionStoreId,
    productId,
    snapshotName: "Pandesal",
    snapshotPrice: 10,
    quantitySold: 2,
    quantityBo: 0,
    boReason: "",
    createdAt: "2026-07-27T11:00:00.000Z",
  });
}

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  mock.rowsByTable = {};
  mock.errorByTable = {};
  mock.gteCalls = [];
});

test("first run pulls unfiltered and records the newest updated_at", async () => {
  mock.rowsByTable.products = [
    productRow,
    { ...productRow, id: "prod-2", updated_at: "2026-07-27T12:00:00+00:00" },
  ];

  await runDownloadSync();

  expect(mock.gteCalls.filter((call) => call.table === "products")).toEqual([]);
  expect(SyncStateDao.getLastSyncedAt("products")).toBe(
    "2026-07-27T12:00:00+00:00",
  );
  expect(ProductsDao.getAllProducts()).toHaveLength(2);
});

test("second run sends the stored cursor to the server", async () => {
  mock.rowsByTable.products = [productRow];
  await runDownloadSync();

  mock.gteCalls = [];
  mock.rowsByTable.products = [];
  await runDownloadSync();

  expect(mock.gteCalls).toContainEqual({
    table: "products",
    column: "updated_at",
    value: "2026-07-27T10:00:00+00:00",
  });
});

test("an empty batch leaves the cursor where it was", async () => {
  mock.rowsByTable.products = [productRow];
  await runDownloadSync();

  mock.rowsByTable.products = [];
  await runDownloadSync();

  expect(SyncStateDao.getLastSyncedAt("products")).toBe(
    "2026-07-27T10:00:00+00:00",
  );
});

test("a server-deleted product is removed from the local table", async () => {
  mock.rowsByTable.products = [productRow];
  await runDownloadSync();
  expect(ProductsDao.getAllProducts()).toHaveLength(1);

  mock.rowsByTable.products = [deletedProductRow];
  await runDownloadSync();

  expect(ProductsDao.getAllProducts()).toEqual([]);
  expect(countProductRows()).toBe(0);
});

test("a server-deleted product is removed even when the agent has sold it", async () => {
  mock.rowsByTable.products = [productRow];
  await runDownloadSync();
  seedSaleFor(productRow.id);

  mock.rowsByTable.products = [deletedProductRow];
  await runDownloadSync();

  expect(countProductRows()).toBe(0);
  // The sale survives with its snapshots intact — that's what history renders.
  expect(SalesDao.getBySessionStoreId(seededSessionStoreId)).toMatchObject([
    { productId: "prod-1", productName: "Pandesal", price: 10 },
  ]);
});

test("a server-deleted price modifier is removed outright", async () => {
  const modifierRow = {
    id: "mod-1",
    product_id: "prod-1",
    province_keyword: "Bulacan",
    price_modifier: 2,
    deleted_at: null,
    updated_at: "2026-07-27T10:00:00+00:00",
  };
  mock.rowsByTable.province_price_modifiers = [modifierRow];
  await runDownloadSync();
  expect(
    ProvincePriceModifiersDao.getAllProvincePriceModifiers(),
  ).toHaveLength(1);

  mock.rowsByTable.province_price_modifiers = [
    {
      ...modifierRow,
      deleted_at: "2026-07-27T13:00:00+00:00",
      updated_at: "2026-07-27T13:00:00+00:00",
    },
  ];
  await runDownloadSync();

  expect(ProvincePriceModifiersDao.getAllProvincePriceModifiers()).toEqual([]);
  expect(
    getDb().getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM province_price_modifiers",
    )?.count,
  ).toBe(0);
});

test("a failed fetch leaves the cursor unchanged so the window is retried", async () => {
  mock.rowsByTable.products = [productRow];
  await runDownloadSync();

  mock.errorByTable.products = { message: "network down" };
  jest.spyOn(console, "warn").mockImplementation(() => {});
  await runDownloadSync();

  expect(SyncStateDao.getLastSyncedAt("products")).toBe(
    "2026-07-27T10:00:00+00:00",
  );
});
