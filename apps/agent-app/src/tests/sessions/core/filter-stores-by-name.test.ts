import { filterStoresByName } from "@/src/features/sessions/core/filter-stores-by-name";
import type { SessionStore } from "@/src/features/sessions/types/session-types";

function store(overrides: Partial<SessionStore>): SessionStore {
  return {
    id: "s1",
    route_session_id: "rs1",
    store_id: "store1",
    store_name: "Store",
    store_province: null,
    store_city: null,
    store_barangay: null,
    store_contact_name: null,
    province_name: null,
    visited: 0,
    created_at: "2026-07-03",
    ...overrides,
  };
}

test("an empty query returns every store", () => {
  const stores = [store({ id: "a" }), store({ id: "b" })];

  expect(filterStoresByName(stores, "")).toEqual(stores);
});

test("a whitespace-only query returns every store", () => {
  const stores = [store({ id: "a" }), store({ id: "b" })];

  expect(filterStoresByName(stores, "   ")).toEqual(stores);
});

test("matching ignores case on both sides", () => {
  const stores = [
    store({ id: "a", store_name: "Lucky Mart" }),
    store({ id: "b", store_name: "Blue Store" }),
  ];

  expect(filterStoresByName(stores, "LUCKY").map((s) => s.id)).toEqual(["a"]);
});

test("a partial match anywhere in the name counts", () => {
  const stores = [
    store({ id: "a", store_name: "Lucky Mart" }),
    store({ id: "b", store_name: "Blue Store" }),
    store({ id: "c", store_name: "Aling Nena" }),
  ];

  // "lu" sits at the start of "Lucky" and in the middle of "Blue"
  expect(filterStoresByName(stores, "lu").map((s) => s.id)).toEqual(["a", "b"]);
});

test("surrounding whitespace in the query is ignored", () => {
  const stores = [store({ id: "a", store_name: "Lucky Mart" })];

  expect(filterStoresByName(stores, "  lucky  ").map((s) => s.id)).toEqual(["a"]);
});

test("a query that matches nothing returns no stores", () => {
  const stores = [
    store({ id: "a", store_name: "Lucky Mart" }),
    store({ id: "b", store_name: "Blue Store" }),
  ];

  expect(filterStoresByName(stores, "zzz")).toEqual([]);
});

test("only the store name is searched, not the location or contact", () => {
  const stores = [
    store({
      id: "a",
      store_name: "Lucky Mart",
      store_city: "Tuguegarao City",
      province_name: "Cagayan",
      store_contact_name: "Nena Cruz",
    }),
  ];

  expect(filterStoresByName(stores, "tuguegarao")).toEqual([]);
  expect(filterStoresByName(stores, "cagayan")).toEqual([]);
  expect(filterStoresByName(stores, "nena")).toEqual([]);
});

test("the input array is not mutated", () => {
  const input = [
    store({ id: "a", store_name: "Lucky Mart" }),
    store({ id: "b", store_name: "Blue Store" }),
  ];
  const snapshot = [...input];

  filterStoresByName(input, "lucky");

  expect(input).toEqual(snapshot);
});
