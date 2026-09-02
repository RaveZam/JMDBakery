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

  test("splits the year into elapsed actuals and Holt-Winters forecasts", () => {
    const { monthly, values } = buildTrailingMonths();
    // The RPC also returns the current, still-in-progress month (Aug) as a
    // 25th bucket -- the client shows it as an actual but keeps it out of the fit.
    const currentMonthPartial = 4321;
    const withCurrent: SalesPoint[] = [
      ...monthly,
      {
        period: monthKey(CURRENT_YEAR, CURRENT_MONTH),
        total_sales: currentMonthPartial,
      },
    ];

    const result = forecastNextYear(withCurrent);

    const actualPoints = result.data.filter((d) => d.actual != null);
    const forecastPoints = result.data.filter((d) => d.forecast != null);

    // Jan-Aug (7 completed + the current month) are actuals; Sep-Dec forecast.
    expect(actualPoints.map((d) => d.label)).toEqual(
      MONTH_LABELS.slice(0, CURRENT_MONTH + 1),
    );
    expect(forecastPoints.map((d) => d.label)).toEqual(
      MONTH_LABELS.slice(CURRENT_MONTH + 1, 12),
    );
    expect(result.forecastStart).toBe(MONTH_LABELS[CURRENT_MONTH + 1]);
    expect(result.forecastEnd).toBe(MONTH_LABELS[11]);

    // Jan-Jul come from the RPC's trailing window; Aug is the partial month.
    expect(actualPoints.slice(0, CURRENT_MONTH).map((d) => d.actual)).toEqual(
      values.slice(-CURRENT_MONTH),
    );
    expect(actualPoints[CURRENT_MONTH].actual).toBe(currentMonthPartial);

    // The forecast is Holt-Winters fit to the same 24 completed months, but
    // starting a horizon later: horizon 1 is the current month, which is shown
    // as an actual instead of forecast, so Sep is horizon 2.
    const expectedForecast = fitHoltWinters(values, 12);
    forecastPoints.forEach((point, i) => {
      expect(point.forecast).toBe(
        Math.max(0, Math.round(expectedForecast(i + 2))),
      );
    });
  });

  test("shows the current month's sales so far as an actual, not a forecast", () => {
    const { monthly } = buildTrailingMonths();
    const withCurrent: SalesPoint[] = [
      ...monthly,
      {
        period: monthKey(CURRENT_YEAR, CURRENT_MONTH),
        total_sales: 250_000,
      },
    ];

    const { data } = forecastNextYear(withCurrent);

    expect(data).toContainEqual({
      label: MONTH_LABELS[CURRENT_MONTH],
      actual: 250_000,
    });
    const forecastLabels = data
      .filter((d) => d.forecast != null)
      .map((d) => d.label);
    expect(forecastLabels).not.toContain(MONTH_LABELS[CURRENT_MONTH]);
    expect(forecastLabels[0]).toBe(MONTH_LABELS[CURRENT_MONTH + 1]);
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
