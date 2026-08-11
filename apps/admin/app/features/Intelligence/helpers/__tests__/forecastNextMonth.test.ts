import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as ss from "simple-statistics";
import { forecastNextMonth } from "../forecastNextMonth";
import type { SalesPoint } from "../../types";

const NOW_ISO = "2026-08-20T04:00:00.000Z"; // Manila: Thu 2026-08-20

describe("forecastNextMonth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW_ISO));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("returns no data with fewer than 2 completed weeks of history", () => {
    const weekly: SalesPoint[] = [{ period: "2026-08-01", total_sales: 1000 }];

    const result = forecastNextMonth(weekly);

    expect(result.data).toEqual([]);
    expect(result.forecastStart).toBe("");
  });

  test("forecasts via linear regression fit to the completed weeks", () => {
    // Distant, well-completed weeks -- far outside the trailing actuals
    // window so this isolates the regression math from the display window.
    const weekly: SalesPoint[] = [
      { period: "2026-01-01", total_sales: 1000 },
      { period: "2026-01-08", total_sales: 1200 },
      { period: "2026-01-15", total_sales: 1400 },
      { period: "2026-01-22", total_sales: 1600 },
    ];

    const result = forecastNextMonth(weekly);
    const forecastPoints = result.data.filter((d) => d.forecast != null);

    const line = ss.linearRegressionLine(
      ss.linearRegression(weekly.map((w, i) => [i, w.total_sales])),
    );
    forecastPoints.forEach((point, step) => {
      expect(point.forecast).toBe(
        Math.max(0, Math.round(line(weekly.length + step))),
      );
    });
    expect(result.title).toBe("Next Month Revenue Forecast");
  });

  test("excludes the current in-progress week from the regression fit", () => {
    const completed: SalesPoint[] = [
      { period: "2026-01-01", total_sales: 1000 },
      { period: "2026-01-08", total_sales: 2000 },
    ];
    // The current week (2026-08-15, containing "now") is in-progress and
    // wildly different -- if it leaked into the fit, the forecast would move.
    const withCurrentWeek: SalesPoint[] = [
      ...completed,
      { period: "2026-08-15", total_sales: 999999 },
    ];

    const withoutCurrent = forecastNextMonth(completed);
    const withCurrent = forecastNextMonth(withCurrentWeek);

    expect(withCurrent.data).toEqual(withoutCurrent.data);
  });

  test("shows only weeks within the trailing window as actuals, labeled by month and week-of-month", () => {
    const weekly: SalesPoint[] = [
      { period: "2026-01-01", total_sales: 1 }, // far outside the window
      { period: "2026-07-15", total_sales: 500 }, // within window, week 3
      { period: "2026-08-01", total_sales: 700 }, // within window, week 1
    ];

    const result = forecastNextMonth(weekly);
    const actualPoints = result.data.filter((d) => d.actual != null);

    expect(actualPoints).toEqual([
      { label: "Jul W3", actual: 500 },
      { label: "Aug W1", actual: 700 },
    ]);
  });
});
