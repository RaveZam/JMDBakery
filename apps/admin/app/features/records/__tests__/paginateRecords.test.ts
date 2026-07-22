import { describe, expect, test } from "vitest";
import { paginateRecords } from "../helpers/paginateRecords";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(id: string): SalesRecord {
  return {
    id,
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
  };
}

const records = Array.from({ length: 7 }, (_, index) => makeRecord(`r${index + 1}`));

describe("paginateRecords", () => {
  test("returns the first slice for page 1", () => {
    const page = paginateRecords(records, 1, 3);

    expect(page.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  test("offsets by page size for later pages", () => {
    const page = paginateRecords(records, 2, 3);

    expect(page.map((r) => r.id)).toEqual(["r4", "r5", "r6"]);
  });

  test("returns the remainder on a partial last page", () => {
    const page = paginateRecords(records, 3, 3);

    expect(page.map((r) => r.id)).toEqual(["r7"]);
  });

  test("returns nothing for a page past the end", () => {
    expect(paginateRecords(records, 4, 3)).toEqual([]);
  });

  test("returns everything when the page size exceeds the record count", () => {
    expect(paginateRecords(records, 1, 100)).toHaveLength(7);
  });

  test("returns an empty list when there are no records", () => {
    expect(paginateRecords([], 1, 10)).toEqual([]);
  });
});
