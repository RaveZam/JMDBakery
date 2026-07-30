// Integration: real SQLite for the "already on this province" filter, mocked
// Supabase for the lookup itself.
import { searchStoresByProvince } from "@/src/features/routes/services/store-search-service";
import { isWifiConnected } from "@/src/lib/network";
import {
  createSchema,
  resetDb,
  seedProvince,
  seedRoute,
  seedStore,
} from "@/src/test-utils/db-test-helpers";
import StoresDao from "@/src/lib/dao/store-dao";

jest.mock("@/src/lib/network", () => ({
  isWifiConnected: jest.fn().mockResolvedValue(true),
}));

const mock = {
  rows: [] as Record<string, unknown>[],
  error: null as { message: string } | null,
  ilikeCalls: [] as { column: string; pattern: string }[],
};

jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => {
      const builder = {
        select: () => builder,
        ilike: (column: string, pattern: string) => {
          mock.ilikeCalls.push({ column, pattern });
          return builder;
        },
        order: () => builder,
        limit: () =>
          Promise.resolve({
            data: mock.error ? null : mock.rows,
            error: mock.error,
          }),
      };
      return builder;
    }),
  },
}));

function remoteStore(overrides: Record<string, unknown> = {}) {
  return {
    id: "remote-1",
    store_name: "Colleague Store",
    province: "Echague",
    city: "Echague",
    barangay: "Poblacion",
    contact_number: "0917",
    contact_name: "Rico",
    created_by_name: "Agent A",
    ...overrides,
  };
}

let provinceId: string;

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  provinceId = seedProvince(seedRoute(), "Echague");
  mock.rows = [];
  mock.error = null;
  mock.ilikeCalls = [];
  (isWifiConnected as jest.Mock).mockResolvedValue(true);
});

test("matches the province as a case-insensitive substring", async () => {
  mock.rows = [remoteStore()];

  const results = await searchStoresByProvince("echa", provinceId);

  expect(mock.ilikeCalls).toEqual([{ column: "province", pattern: "%echa%" }]);
  expect(results).toEqual([
    {
      id: "remote-1",
      name: "Colleague Store",
      province: "Echague",
      city: "Echague",
      barangay: "Poblacion",
      contactName: "Rico",
      contactPhone: "0917",
      createdByName: "Agent A",
    },
  ]);
});

test("hides stores already on this province", async () => {
  const existingId = seedStore(provinceId, "Already Here");
  mock.rows = [remoteStore({ id: existingId }), remoteStore({ id: "remote-2" })];

  const results = await searchStoresByProvince("Echague", provinceId);

  expect(results.map((store) => store.id)).toEqual(["remote-2"]);
});

test("a store on another province is still offered", async () => {
  const elsewhereId = seedStore(seedProvince(seedRoute(), "Elsewhere"));
  mock.rows = [remoteStore({ id: elsewhereId })];

  const results = await searchStoresByProvince("Echague", provinceId);

  expect(results.map((store) => store.id)).toEqual([elsewhereId]);
});

test("an empty term searches for nothing rather than everything", async () => {
  mock.rows = [remoteStore()];

  expect(await searchStoresByProvince("   ", provinceId)).toEqual([]);
  expect(mock.ilikeCalls).toEqual([]);
});

test("explains itself when offline instead of returning an empty list", async () => {
  (isWifiConnected as jest.Mock).mockResolvedValue(false);

  await expect(searchStoresByProvince("Echague", provinceId)).rejects.toThrow(
    /internet connection/i,
  );
});

test("surfaces a failed lookup", async () => {
  mock.error = { message: "network down" };

  await expect(searchStoresByProvince("Echague", provinceId)).rejects.toThrow(
    "network down",
  );
});

test("a picked store keeps the registering agent's province_id once added", async () => {
  // Guards the invariant the whole junction rests on: adopting never rewrites
  // the store row, so the colleague's own copy is undisturbed.
  const storeId = seedStore(seedProvince(seedRoute(), "Elsewhere"));
  const before = StoresDao.getStoreById(storeId)?.province_id;

  mock.rows = [remoteStore({ id: storeId })];
  await searchStoresByProvince("Echague", provinceId);

  expect(StoresDao.getStoreById(storeId)?.province_id).toBe(before);
});
