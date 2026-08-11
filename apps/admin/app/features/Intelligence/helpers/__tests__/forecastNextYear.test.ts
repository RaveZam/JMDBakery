import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { forecastNextYear } from "../forecastNextYear";
import { fitHoltWinters } from "../holtWinters";
import { toDateKey, MONTH_LABELS } from "../dateUtils";
import type { SalesPoint } from "../../types";

const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 7; // August, 0-indexed -- 7 completed months so far

function monthKey(year: number, month: number): string {
  return toDateKey(new Date(Date.UTC(year, month, 1)));
}

/** 24 months of synthetic revenue with both a trend and a seasonal wobble,
 * ending the month before CURRENT_MONTH -- exactly what completedMonths()
 * expects to find in the RPC data. */
function buildTrailingMonths(): { monthly: SalesPoint[]; values: number[] } {
  const seasonalPattern = [0, 200, 400, 200, 0, -200, -400, -200, 0, 200, 400, -600];
  const values = Array.from(
    { length: 24 },
    (_, i) => 5000 + i * 20 + seasonalPattern[i % 12],
  );

  const monthly = values.map((total_sales, i) => {
    const ago = 24 - i;
    return { period: monthKey(CURRENT_YEAR, CURRENT_MONTH - ago), total_sales };
  });

  return { monthly, values };
}

describe("forecastNextYear", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Manila (UTC+8) reads as 2026-08-15 for this timestamp.
    vi.setSystemTime(new Date("2026-08-15T04:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns no data without two full years of completed months", () => {
    const { monthly } = buildTrailingMonths();

    const result = forecastNextYear(monthly.slice(1)); // 23 months

    expect(result.data).toEqual([]);
    expect(result.forecastStart).toBe("");
    expect(result.forecastEnd).toBe("");
    expect(result.title).toContain("Holt-Winters");
  });

  test("splits the year into completed actuals and Holt-Winters forecasts", () => {
    const { monthly, values } = buildTrailingMonths();

    const result = forecastNextYear(monthly);

    const actualPoints = result.data.filter((d) => d.actual != null);
    const forecastPoints = result.data.filter((d) => d.forecast != null);

    // Jan-Jul (7 completed months) are actuals, Aug-Dec (5 months) are forecast.
    expect(actualPoints).toHaveLength(CURRENT_MONTH);
    expect(forecastPoints).toHaveLength(12 - CURRENT_MONTH);
    expect(actualPoints.map((d) => d.label)).toEqual(
      MONTH_LABELS.slice(0, CURRENT_MONTH),
    );
    expect(forecastPoints.map((d) => d.label)).toEqual(
      MONTH_LABELS.slice(CURRENT_MONTH, 12),
    );
    expect(result.forecastStart).toBe(MONTH_LABELS[CURRENT_MONTH]);
    expect(result.forecastEnd).toBe(MONTH_LABELS[11]);

    // The actuals should be the same revenue figures the RPC reported for
    // Jan-Jul, i.e. the last 7 entries of the trailing-24-month window.
    expect(actualPoints.map((d) => d.actual)).toEqual(values.slice(-CURRENT_MONTH));

    // The forecast values should be exactly what fitting Holt-Winters on the
    // same 24 completed months produces -- this is the same series
    // completedMonths() builds internally.
    const expectedForecast = fitHoltWinters(values, 12);
    forecastPoints.forEach((point, i) => {
      const horizon = i + 1;
      expect(point.forecast).toBe(Math.max(0, Math.round(expectedForecast(horizon))));
    });
  });

  test("never forecasts negative revenue", () => {
    const { monthly } = buildTrailingMonths();
    const droppedToZero = monthly.map((point) => ({ ...point, total_sales: 0 }));

    const result = forecastNextYear(droppedToZero);

    result.data.forEach((point) => {
      if (point.forecast != null) expect(point.forecast).toBeGreaterThanOrEqual(0);
    });
  });
});
