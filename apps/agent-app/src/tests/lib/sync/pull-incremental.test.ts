// The bug this file guards: PostgREST caps a response at 1000 rows, so a table
// with more changes than that comes back truncated. Without an ORDER BY the
// truncated page is an arbitrary subset, and advancing the cursor past it drops
// every row that didn't make the cut — silently and permanently.
import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { downloadProducts } from "@/src/lib/sync/download/products";

// Named with a `mock` prefix so jest's out-of-scope guard allows the factory
// below to close over them.
type MockRow = { id: string; updated_at: string };

const mock = {
  rowsByTable: {} as Record<string, MockRow[]>,
  pageSizes: [] as number[],
};
type MockBuilder = {
  select: () => MockBuilder;
  order: () => MockBuilder;
  limit: (count: number) => MockBuilder;
  gte: (column: string, value: string) => MockBuilder;
  returns: () => MockBuilder;
  then: (
    resolve: (value: { data: MockRow[]; error: null }) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise<unknown>;
};

// Stand-in for the query builder that actually honours gte + order + limit, so
// paging behaves the way PostgREST does instead of returning everything at once.
jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: jest.fn((table: string): MockBuilder => {
      let floor: string | null = null;
      let cap = Infinity;

      const builder: MockBuilder = {
        select: () => builder,
        order: () => builder,
        limit: (count) => {
          cap = count;
          return builder;
        },
        gte: (_column, value) => {
          floor = value;
          return builder;
        },
        returns: () => builder,
        then: (resolve, reject) => {
          const rows = (mock.rowsByTable[table] ?? [])
            .filter((row) => floor === null || row.updated_at >= floor)
            .sort((a, b) => a.updated_at.localeCompare(b.updated_at))
            .slice(0, cap);
          mock.pageSizes.push(rows.length);
          return Promise.resolve({ data: rows, error: null }).then(
            resolve,
            reject,
          );
        },
      };

      return builder;
    }),
  },
}));

/** `count` products, each stamped one second after the last. */
function seedRemoteProducts(count: number): (MockRow & {
  product_name: string;
  product_price: number;
  deleted_at: string | null;
})[] {
  const start = Date.parse("2026-08-20T00:00:00.000Z");
  return Array.from({ length: count }, (_, index) => ({
    id: `prod-${index}`,
    product_name: `Product ${index}`,
    product_price: 10,
    deleted_at: null,
    updated_at: new Date(start + index * 1000).toISOString(),
  }));
}

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  mock.rowsByTable = {};
  mock.pageSizes = [];
});

test("pulls every row when the change set is larger than one page", async () => {
  const remote = seedRemoteProducts(2500);
  mock.rowsByTable.products = remote;

  await downloadProducts();

  expect(ProductsDao.getAllProducts()).toHaveLength(2500);
  // Two full pages plus the short one that ends the walk. Each page after the
  // first re-reads its boundary row, because the walk resumes with `gte` rather
  // than `gt` — cheaper than risking a row that shares the boundary timestamp.
  expect(mock.pageSizes).toEqual([1000, 1000, 502]);
});

test("does not advance the cursor past a row it never applied", async () => {
  mock.rowsByTable.products = seedRemoteProducts(2500);

  await downloadProducts();

  const cursor = SyncStateDao.getLastSyncedAt("products")!;
  const unapplied = mock.rowsByTable.products.filter(
    (row) => row.updated_at < cursor,
  );
  const localIds = new Set(ProductsDao.getAllProducts().map((p) => p.id));

  // Anything now behind the cursor is unreachable forever, so all of it must
  // already be on the device.
  expect(unapplied.every((row) => localIds.has(row.id))).toBe(true);
});

test("resumes from the cursor instead of re-pulling everything", async () => {
  mock.rowsByTable.products = seedRemoteProducts(1200);
  await downloadProducts();

  mock.pageSizes = [];
  await downloadProducts();

  // Only the 5s overlap the safety lag deliberately keeps, not 1200 rows.
  expect(mock.pageSizes[0]).toBeLessThan(20);
});
