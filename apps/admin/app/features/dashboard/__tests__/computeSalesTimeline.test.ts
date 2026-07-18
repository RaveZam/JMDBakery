import { describe, expect, test } from "vitest";
import { computeSalesTimeline } from "../helpers/computeSalesTimeline";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeSale(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "sale-1",
    sessionId: "session-1",
    date: "2026-07-15",
    createdAt: "2026-07-15T09:30:00Z",
    agent: "Ana",
    store: "Store A",
    province: "Cebu",
    product: "Pandesal",
    soldQty: 10,
    boQty: 0,
    unitPrice: 10,
    total: 100,
    ...overrides,
  };
}

describe("computeSalesTimeline — today", () => {
  test("buckets sales into hourly points", () => {
    const data = [
      makeSale({ createdAt: "2026-07-15T09:00:00Z", total: 100 }),
      makeSale({ createdAt: "2026-07-15T09:45:00Z", total: 50 }),
      makeSale({ createdAt: "2026-07-15T14:10:00Z", total: 200 }),
    ];

    expect(computeSalesTimeline(data, "today")).toEqual([
      { label: "9am", sales: 150 },
      { label: "2pm", sales: 200 },
    ]);
  });

  test("orders hours chronologically regardless of input order", () => {
    const data = [
      makeSale({ createdAt: "2026-07-15T22:00:00Z", total: 1 }),
      makeSale({ createdAt: "2026-07-15T03:00:00Z", total: 1 }),
      makeSale({ createdAt: "2026-07-15T11:00:00Z", total: 1 }),
    ];

    expect(computeSalesTimeline(data, "today").map((p) => p.label)).toEqual([
      "3am",
      "11am",
      "10pm",
    ]);
  });

  test("skips records with no timestamp", () => {
    const data = [
      makeSale({ createdAt: null, total: 999 }),
      makeSale({ createdAt: "2026-07-15T09:00:00Z", total: 100 }),
    ];

    expect(computeSalesTimeline(data, "today")).toEqual([
      { label: "9am", sales: 100 },
    ]);
  });

  test("returns no points when there are no sales", () => {
    expect(computeSalesTimeline([], "today")).toEqual([]);
  });
});

describe("computeSalesTimeline — multi-day", () => {
  test("buckets sales into one point per day, oldest first", () => {
    const data = [
      makeSale({ date: "2026-07-16", total: 300 }),
      makeSale({ date: "2026-07-15", total: 100 }),
      makeSale({ date: "2026-07-15", total: 50 }),
    ];

    expect(computeSalesTimeline(data, "7days")).toEqual([
      { label: "Wed", sales: 150 },
      { label: "Thu", sales: 300 },
    ]);
  });

  test("uses month-and-day labels on the 30-day range", () => {
    const data = [makeSale({ date: "2026-07-15", total: 100 })];

    expect(computeSalesTimeline(data, "30days")).toEqual([
      { label: "Jul 15", sales: 100 },
    ]);
  });

  test("counts a day's sales even when timestamps are missing", () => {
    const data = [makeSale({ date: "2026-07-15", createdAt: null, total: 75 })];

    expect(computeSalesTimeline(data, "7days")).toEqual([
      { label: "Wed", sales: 75 },
    ]);
  });

  test("returns no points when there are no sales", () => {
    expect(computeSalesTimeline([], "7days")).toEqual([]);
  });
});
