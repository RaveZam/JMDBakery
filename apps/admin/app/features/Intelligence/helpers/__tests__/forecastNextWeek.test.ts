import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { forecastNextWeek } from "../forecastNextWeek";
import { nowInManila, addDays, toDateKey } from "../dateUtils";
import type { SalesPoint } from "../../types";

describe("forecastNextWeek", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T04:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows the trailing 7 days as actuals, defaulting missing days to 0", () => {
    const today = nowInManila();
    const daily: SalesPoint[] = [
      { period: toDateKey(addDays(today, -6)), total_sales: 500 },
      // day -5 has no data at all
      { period: toDateKey(today), total_sales: 300 },
    ];

    const result = forecastNextWeek(daily);
    const actualPoints = result.data.filter((d) => d.actual != null);

    expect(actualPoints).toHaveLength(7);
    expect(actualPoints[0]).toEqual({
      label: toDateKey(addDays(today, -6)),
      actual: 500,
    });
    expect(actualPoints[5]).toEqual({
      label: toDateKey(addDays(today, -1)),
      actual: 0,
    });
    expect(actualPoints[6]).toEqual({ label: toDateKey(today), actual: 300 });
  });

  test("forecasts each of the next 7 days from that weekday's historical average", () => {
    const today = nowInManila();
    // Two occurrences of "one week before tomorrow" and "two weeks before
    // tomorrow" give tomorrow's weekday an average of (100+300)/2 = 200.
    const daily: SalesPoint[] = [
      { period: toDateKey(addDays(today, -6)), total_sales: 100 },
      { period: toDateKey(addDays(today, -13)), total_sales: 300 },
    ];

    const result = forecastNextWeek(daily);
    const forecastPoints = result.data.filter((d) => d.forecast != null);

    expect(forecastPoints).toHaveLength(7);
    // Tomorrow (offset +1) shares a weekday with -6 days ago.
    expect(forecastPoints[0]).toEqual({
      label: toDateKey(addDays(today, 1)),
      forecast: 200,
    });
  });

  test("forecasts 0 for a weekday with no historical occurrence", () => {
    const result = forecastNextWeek([]);

    expect(result.data.every((d) => d.forecast == null || d.forecast === 0)).toBe(
      true,
    );
  });

  test("always returns a 7-day-ago .. +7-day window regardless of history", () => {
    const result = forecastNextWeek([]);

    expect(result.data).toHaveLength(14);
    expect(result.title).toBe("7-day revenue forecast");
  });
});
