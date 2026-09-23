import { describe, expect, test } from "vitest";
import { filterRecordsByDateRange } from "../helpers/filterRecordsByDateRange";
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

describe("filterRecordsByDateRange", () => {
  test("keeps every record when both bounds are blank", () => {
    const records = [makeRecord({ date: "2026-01-01" }), makeRecord({ date: "2026-12-31" })];

    expect(filterRecordsByDateRange(records, "", "")).toEqual(records);
  });

  test("drops records before the start date", () => {
    const before = makeRecord({ id: "before", date: "2026-07-01" });
    const onStart = makeRecord({ id: "on-start", date: "2026-07-10" });
    const after = makeRecord({ id: "after", date: "2026-07-20" });

    const result = filterRecordsByDateRange([before, onStart, after], "2026-07-10", "");

    expect(result.map((r) => r.id)).toEqual(["on-start", "after"]);
  });

  test("drops records after the end date", () => {
    const before = makeRecord({ id: "before", date: "2026-07-01" });
    const onEnd = makeRecord({ id: "on-end", date: "2026-07-10" });
    const after = makeRecord({ id: "after", date: "2026-07-20" });

    const result = filterRecordsByDateRange([before, onEnd, after], "", "2026-07-10");

    expect(result.map((r) => r.id)).toEqual(["before", "on-end"]);
  });

  test("keeps only records inside both bounds, inclusive", () => {
    const records = [
      makeRecord({ id: "too-early", date: "2026-07-01" }),
      makeRecord({ id: "start", date: "2026-07-05" }),
      makeRecord({ id: "middle", date: "2026-07-10" }),
      makeRecord({ id: "end", date: "2026-07-15" }),
      makeRecord({ id: "too-late", date: "2026-07-20" }),
    ];

    const result = filterRecordsByDateRange(records, "2026-07-05", "2026-07-15");

    expect(result.map((r) => r.id)).toEqual(["start", "middle", "end"]);
  });

  test("returns an empty list when given no records", () => {
    expect(filterRecordsByDateRange([], "2026-07-01", "2026-07-31")).toEqual([]);
  });
});
