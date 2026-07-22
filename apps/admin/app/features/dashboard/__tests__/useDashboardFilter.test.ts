import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardFilter } from "../hooks/useDashboardFilter";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeSale(date: string, overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: `sale-${date}`,
    sessionId: "session-1",
    date,
    createdAt: `${date}T09:00:00Z`,
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

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0)); // 2026-07-15
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDashboardFilter", () => {
  test("starts on the 7-day range", () => {
    const { result } = renderHook(() => useDashboardFilter([]));

    expect(result.current.filter).toBe("7days");
  });

  test("keeps only records inside the active range", () => {
    const data = [
      makeSale("2026-07-15"), // today — in range
      makeSale("2026-07-09"), // oldest day in range
      makeSale("2026-07-08"), // one day too old
    ];

    const { result } = renderHook(() => useDashboardFilter(data));

    expect(result.current.data.map((r) => r.date)).toEqual([
      "2026-07-15",
      "2026-07-09",
    ]);
  });

  test("narrows to a single day when switching to today", () => {
    const data = [makeSale("2026-07-15"), makeSale("2026-07-14")];
    const { result } = renderHook(() => useDashboardFilter(data));

    act(() => result.current.onFilterChange("today"));

    expect(result.current.filter).toBe("today");
    expect(result.current.data.map((r) => r.date)).toEqual(["2026-07-15"]);
  });

  test("widens the window when switching to 30 days", () => {
    const data = [makeSale("2026-07-15"), makeSale("2026-06-20")];
    const { result } = renderHook(() => useDashboardFilter(data));

    expect(result.current.data).toHaveLength(1); // 7-day default excludes June

    act(() => result.current.onFilterChange("30days"));

    expect(result.current.data).toHaveLength(2);
  });

  test("excludes future-dated records", () => {
    const data = [makeSale("2026-07-15"), makeSale("2026-07-20")];

    const { result } = renderHook(() => useDashboardFilter(data));

    expect(result.current.data.map((r) => r.date)).toEqual(["2026-07-15"]);
  });

  test("returns nothing when there is no data at all", () => {
    const { result } = renderHook(() => useDashboardFilter([]));

    expect(result.current.data).toEqual([]);
  });
});
