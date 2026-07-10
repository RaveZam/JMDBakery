import { groupStoresByProvince } from "@/src/features/sessions/core/group-stores-by-province";
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

test("no stores produces no sections", () => {
  expect(groupStoresByProvince([])).toEqual([]);
});

test("stores in the same province land in one section, in order", () => {
  const sections = groupStoresByProvince([
    store({ id: "a", province_name: "Cebu" }),
    store({ id: "b", province_name: "Cebu" }),
  ]);

  expect(sections).toHaveLength(1);
  expect(sections[0].title).toBe("Cebu");
  expect(sections[0].data.map((s) => s.id)).toEqual(["a", "b"]);
});

test("sections keep first-seen province order", () => {
  const sections = groupStoresByProvince([
    store({ id: "a", province_name: "Cebu" }),
    store({ id: "b", province_name: "Bohol" }),
    store({ id: "c", province_name: "Cebu" }),
  ]);

  expect(sections.map((s) => s.title)).toEqual(["Cebu", "Bohol"]);
  expect(sections[0].data.map((s) => s.id)).toEqual(["a", "c"]);
  expect(sections[1].data.map((s) => s.id)).toEqual(["b"]);
});

test("a missing province is grouped under 'Unknown'", () => {
  const sections = groupStoresByProvince([store({ id: "a", province_name: null })]);

  expect(sections).toHaveLength(1);
  expect(sections[0].title).toBe("Unknown");
});

test("the input array is not mutated", () => {
  const input = [
    store({ id: "a", province_name: "Cebu" }),
    store({ id: "b", province_name: "Bohol" }),
  ];
  const snapshot = [...input];

  groupStoresByProvince(input);

  expect(input).toEqual(snapshot); // same length, same elements, untouched
});
