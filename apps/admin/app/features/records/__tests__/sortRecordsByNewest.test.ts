import { describe, expect, test } from "vitest";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { sortRecordsByNewest } from "../helpers/sortRecordsByNewest";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "record-1",
    sessionId: "session-1",
    date: "2026-08-31",
    createdAt: "2026-08-31T14:01:36.013+00:00",
    agent: "Agent1",
    store: "Store A",
    province: "Cebu",
    product: "Ube Cheese Pandesal",
    soldQty: 10,
    boQty: 0,
    unitPrice: 25,
    total: 250,
    boReason: null,
    paymentType: "cash",
    ...overrides,
  };
}

describe("sortRecordsByNewest", () => {
  test("puts the most recent sale first", () => {
    const records = [
      makeRecord({ id: "older", createdAt: "2026-08-31T14:01:36.013+00:00" }),
      makeRecord({ id: "newest", createdAt: "2026-09-01T10:01:31.897+00:00" }),
      makeRecord({ id: "middle", createdAt: "2026-08-31T14:22:20.730+00:00" }),
    ];

    expect(sortRecordsByNewest(records).map((r) => r.id)).toEqual([
      "newest",
      "middle",
      "older",
    ]);
  });

});

describe("sortRecordsByNewest across sessions", () => {
  test("interleaves rows from different sessions by their own timestamp", () => {
    // The reported case: a sale logged today sits inside a session that was
    // started yesterday, so grouping by session would bury it.
    const records = [
      makeRecord({
        id: "yesterday-session-today-sale",
        sessionId: "session-aug31",
        date: "2026-09-01",
        createdAt: "2026-09-01T10:01:31.897+00:00",
      }),
      makeRecord({
        id: "yesterday-session-yesterday-sale",
        sessionId: "session-aug31",
        date: "2026-08-31",
        createdAt: "2026-08-31T14:22:20.730+00:00",
      }),
      makeRecord({
        id: "today-session-today-sale",
        sessionId: "session-sep01",
        date: "2026-09-01",
        createdAt: "2026-09-01T11:30:00.000+00:00",
      }),
    ];

    expect(sortRecordsByNewest(records).map((r) => r.id)).toEqual([
      "today-session-today-sale",
      "yesterday-session-today-sale",
      "yesterday-session-yesterday-sale",
    ]);
  });

});

describe("sortRecordsByNewest without timestamps", () => {
  test("falls back to the row's date when it has no timestamp", () => {
    const records = [
      makeRecord({ id: "no-timestamp-older", createdAt: null, date: "2026-08-30" }),
      makeRecord({ id: "no-timestamp-newer", createdAt: null, date: "2026-09-01" }),
    ];

    expect(sortRecordsByNewest(records).map((r) => r.id)).toEqual([
      "no-timestamp-newer",
      "no-timestamp-older",
    ]);
  });

  test("orders a timestamped row against one that only has a date", () => {
    const records = [
      makeRecord({ id: "dated-only", createdAt: null, date: "2026-08-31" }),
      makeRecord({ id: "timestamped", createdAt: "2026-09-01T10:01:31.897+00:00" }),
    ];

    expect(sortRecordsByNewest(records).map((r) => r.id)).toEqual([
      "timestamped",
      "dated-only",
    ]);
  });

  test("does not modify the array it is given", () => {
    const records = [
      makeRecord({ id: "older", createdAt: "2026-08-31T14:01:36.013+00:00" }),
      makeRecord({ id: "newer", createdAt: "2026-09-01T10:01:31.897+00:00" }),
    ];

    sortRecordsByNewest(records);

    expect(records.map((r) => r.id)).toEqual(["older", "newer"]);
  });
});
