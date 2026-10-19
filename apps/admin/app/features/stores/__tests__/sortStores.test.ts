import { describe, expect, test } from "vitest";
import { sortStores } from "../core/sortStores";
import type { RankedStore } from "../types/store-types";

function makeStore(overrides: Partial<RankedStore>): RankedStore {
  return {
    id: "s",
    storeName: "Store",
    contactNumber: null,
    contactName: null,
    province: null,
    city: null,
    barangay: null,
    createdAt: "2026-01-01T00:00:00Z",
    totalRevenue: 0,
    memberIds: ["s"],
    creditTaken: 0,
    paidBack: 0,
    balance: 0,
    lastPaymentAt: null,
    rank: 1,
    ...overrides,
  };
}

const stores = [
  makeStore({ id: "b", storeName: "Bravo", totalRevenue: 200, createdAt: "2026-02-01T00:00:00Z", rank: 1 }),
  makeStore({ id: "c", storeName: "Charlie", totalRevenue: 50, createdAt: "2026-03-01T00:00:00Z", rank: 2 }),
  makeStore({ id: "a", storeName: "Alpha", totalRevenue: 100, createdAt: "2026-01-01T00:00:00Z", rank: 3 }),
];

const ids = (list: RankedStore[]) => list.map((store) => store.id);

describe("sortStores", () => {
  test("revenue high to low and low to high", () => {
    expect(ids(sortStores(stores, "revenue-high"))).toEqual(["b", "a", "c"]);
    expect(ids(sortStores(stores, "revenue-low"))).toEqual(["c", "a", "b"]);
  });

  test("name A to Z and Z to A", () => {
    expect(ids(sortStores(stores, "name-asc"))).toEqual(["a", "b", "c"]);
    expect(ids(sortStores(stores, "name-desc"))).toEqual(["c", "b", "a"]);
  });

  test("newest and oldest", () => {
    expect(ids(sortStores(stores, "newest"))).toEqual(["c", "b", "a"]);
    expect(ids(sortStores(stores, "oldest"))).toEqual(["a", "b", "c"]);
  });

  test("keeps each store's rank and does not mutate the input", () => {
    const sorted = sortStores(stores, "name-asc");
    expect(sorted.find((store) => store.id === "a")?.rank).toBe(3);
    expect(ids(stores)).toEqual(["b", "c", "a"]);
  });
});
