import { describe, expect, test } from "vitest";
import { searchRecords } from "../helpers/searchRecords";
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
    paymentType: "cash",
    ...overrides,
  };
}

describe("searchRecords", () => {
  test("returns every record when the search is blank", () => {
    const records = [makeRecord({ id: "a" }), makeRecord({ id: "b" })];

    expect(searchRecords(records, "")).toEqual(records);
  });

  test("matches on store name, case-insensitively", () => {
    const records = [makeRecord({ id: "match", store: "Gaisano Grand Mall" })];

    expect(searchRecords(records, "GRAND")).toHaveLength(1);
  });

  test("does not match on agent, province, or product", () => {
    const records = [
      makeRecord({ id: "by-agent", agent: "Marites" }),
      makeRecord({ id: "by-province", province: "Marites Province" }),
      makeRecord({ id: "by-product", product: "Marites Bread" }),
    ];

    expect(searchRecords(records, "marites")).toEqual([]);
  });

  test("ignores surrounding whitespace, but treats whitespace-only as no search", () => {
    const records = [makeRecord({ id: "match", store: "Ana Sari-Sari" })];

    expect(searchRecords(records, "   ana   ")).toHaveLength(1);
    expect(searchRecords(records, "   ")).toEqual(records);
  });

  test("returns nothing when no store matches", () => {
    const records = [makeRecord({ id: "a", store: "Store A" })];

    expect(searchRecords(records, "zzz")).toEqual([]);
  });
});
