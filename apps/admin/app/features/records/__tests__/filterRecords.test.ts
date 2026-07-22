import { describe, expect, test } from "vitest";
import { filterRecords } from "../helpers/filterRecords";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "record-1",
    sessionId: "session-1",
    date: "2026-07-15",
    createdAt: "2026-07-15T09:00:00Z",
    agent: "Ana",
    store: "Store A",
    province: "Cebu",
    product: "Pandesal",
    soldQty: 10,
    boQty: 0,
    unitPrice: 10,
    total: 100,
    boReason: null,
    ...overrides,
  };
}

const soldOnly = makeRecord({ id: "sold", soldQty: 10, boQty: 0 });
const badOrderOnly = makeRecord({ id: "bad", soldQty: 0, boQty: 4 });
const split = makeRecord({ id: "split", soldQty: 6, boQty: 2 });
const empty = makeRecord({ id: "empty", soldQty: 0, boQty: 0 });

describe("filterRecords", () => {
  test("keeps every record on the 'all' view with no search", () => {
    const records = [soldOnly, badOrderOnly, split, empty];

    expect(filterRecords(records, "all", "")).toEqual(records);
  });

  test("keeps only records with sold units on the sales view", () => {
    const result = filterRecords([soldOnly, badOrderOnly, split, empty], "sales", "");

    expect(result.map((r) => r.id)).toEqual(["sold", "split"]);
  });

  test("keeps only records with bad-order units on the bad orders view", () => {
    const result = filterRecords([soldOnly, badOrderOnly, split, empty], "bad-orders", "");

    expect(result.map((r) => r.id)).toEqual(["bad", "split"]);
  });

  test("matches the search against agent, store, province, and product", () => {
    const records = [
      makeRecord({ id: "by-agent", agent: "Marites" }),
      makeRecord({ id: "by-store", store: "Marites Sari-Sari" }),
      makeRecord({ id: "by-province", province: "Marites Province" }),
      makeRecord({ id: "by-product", product: "Marites Bread" }),
      makeRecord({ id: "no-match" }),
    ];

    const result = filterRecords(records, "all", "marites");

    expect(result.map((r) => r.id)).toEqual([
      "by-agent",
      "by-store",
      "by-province",
      "by-product",
    ]);
  });

  test("matches partial text case-insensitively", () => {
    const records = [makeRecord({ id: "match", store: "Gaisano Grand Mall" })];

    expect(filterRecords(records, "all", "GRAND")).toHaveLength(1);
  });

  test("ignores surrounding whitespace in the search", () => {
    const records = [makeRecord({ id: "match", agent: "Ana" })];

    expect(filterRecords(records, "all", "   ana   ")).toHaveLength(1);
  });

  test("treats a whitespace-only search as no search at all", () => {
    const records = [soldOnly, badOrderOnly];

    expect(filterRecords(records, "all", "   ")).toEqual(records);
  });

  test("applies the view and the search together", () => {
    const records = [
      makeRecord({ id: "sold-ana", agent: "Ana", soldQty: 10, boQty: 0 }),
      makeRecord({ id: "bad-ana", agent: "Ana", soldQty: 0, boQty: 3 }),
      makeRecord({ id: "bad-ben", agent: "Ben", soldQty: 0, boQty: 3 }),
    ];

    const result = filterRecords(records, "bad-orders", "ana");

    expect(result.map((r) => r.id)).toEqual(["bad-ana"]);
  });

  test("returns nothing when the search matches no record", () => {
    expect(filterRecords([soldOnly, badOrderOnly], "all", "zzz")).toEqual([]);
  });

  test("returns an empty list when given no records", () => {
    expect(filterRecords([], "sales", "ana")).toEqual([]);
  });
});
