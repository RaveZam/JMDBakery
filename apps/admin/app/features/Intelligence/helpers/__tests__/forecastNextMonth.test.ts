import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as ss from "simple-statistics";
import { forecastNextMonth } from "../forecastNextMonth";
import type { ForecastData } from "@/app/server/salesData/getForecastSeries";

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
    const weekly: ForecastData[] = [{ period: "2026-08-01", total_sales_amount: 1000 }];

    const result = forecastNextMonth(weekly);

    expect(result.data).toEqual([]);
    expect(result.forecastStart).toBe("");
  });

  test("forecasts via linear regression fit to the completed weeks", () => {
    // Distant, well-completed weeks -- far outside the trailing actuals
    // window so this isolates the regression math from the display window.
    const weekly: ForecastData[] = [
      { period: "2026-01-01", total_sales_amount: 1000 },
      { period: "2026-01-08", total_sales_amount: 1200 },
      { period: "2026-01-15", total_sales_amount: 1400 },
      { period: "2026-01-22", total_sales_amount: 1600 },
    ];

    const result = forecastNextMonth(weekly);
    const forecastPoints = result.data.filter((d) => d.forecast != null);

    const line = ss.linearRegressionLine(
      ss.linearRegression(weekly.map((w, i) => [i, w.total_sales_amount])),
    );
    forecastPoints.forEach((point, step) => {
      expect(point.forecast).toBe(
        Math.max(0, Math.round(line(weekly.length + step))),
      );
    });
    expect(result.title).toBe("Sales vs BO Forecast");
  });

  test("leaves the in-progress week out of the fit but still shows it as an actual", () => {
    const completed: ForecastData[] = [
      { period: "2026-01-01", total_sales_amount: 1000 },
      { period: "2026-01-08", total_sales_amount: 2000 },
    ];
    // The current week (2026-08-15, containing "now") is in-progress. Its
    // partial sales-so-far must not move the trend line.
    const withCurrentWeek: ForecastData[] = [
      ...completed,
      { period: "2026-08-15", total_sales_amount: 999999 },
    ];

    const withoutCurrent = forecastNextMonth(completed);
    const withCurrent = forecastNextMonth(withCurrentWeek);

    // The huge current week does not change the projection -- same fit either way.
    const forecastAt = (r: typeof withCurrent, label: string) =>
      r.data.find((d) => d.label === label)?.forecast ?? 0;
    expect(forecastAt(withCurrent, "Sep W1")).toBe(
      forecastAt(withoutCurrent, "Sep W1"),
    );

    // Its sales-so-far still show as an actual, and it is not drawn as a forecast.
    expect(withCurrent.data).toContainEqual({ label: "Aug W3", salesAmount: 999999 });
    const forecastLabels = withCurrent.data
      .filter((d) => d.forecast != null)
      .map((d) => d.label);
    expect(forecastLabels).not.toContain("Aug W3");
    expect(forecastLabels[0]).toBe("Aug W4");
  });

  test("carries the in-progress-week caveat as a note", () => {
    const weekly: ForecastData[] = [
      { period: "2026-01-01", total_sales_amount: 1000 },
      { period: "2026-01-08", total_sales_amount: 1200 },
    ];

    expect(forecastNextMonth(weekly).note).toMatch(/in-progress week/i);
  });

  test("plots sales from the current in-progress week as an actual, not a forecast", () => {
    // now = 2026-08-20 -> current week is Aug W3 (period 2026-08-15)
    const weekly: ForecastData[] = [
      { period: "2026-07-15", total_sales_amount: 1000 },
      { period: "2026-08-01", total_sales_amount: 1000 },
      { period: "2026-08-08", total_sales_amount: 1000 },
      { period: "2026-08-15", total_sales_amount: 200_000 }, // booked so far this week
    ];

    const { data } = forecastNextMonth(weekly);

    expect(data).toContainEqual({ label: "Aug W3", salesAmount: 200_000 });
    const forecastLabels = data
      .filter((d) => d.forecast != null)
      .map((d) => d.label);
    expect(forecastLabels).not.toContain("Aug W3");
    expect(forecastLabels[0]).toBe("Aug W4");
  });

  test("still forecasts the current week when nothing has been booked in it yet", () => {
    const weekly: ForecastData[] = [
      { period: "2026-07-15", total_sales_amount: 1000 },
      { period: "2026-08-01", total_sales_amount: 1100 },
      { period: "2026-08-08", total_sales_amount: 1200 },
    ];

    const { data } = forecastNextMonth(weekly);
    const forecastLabels = data
      .filter((d) => d.forecast != null)
      .map((d) => d.label);

    expect(forecastLabels[0]).toBe("Aug W3");
    expect(
      data.some((d) => d.label === "Aug W3" && d.salesAmount != null),
    ).toBe(false);
  });

  test("shows only weeks within the trailing window as actuals, labeled by month and week-of-month", () => {
    const weekly: ForecastData[] = [
      { period: "2026-01-01", total_sales_amount: 1 }, // far outside the window
      { period: "2026-07-15", total_sales_amount: 500 }, // within window, week 3
      { period: "2026-08-01", total_sales_amount: 700 }, // within window, week 1
    ];

    const result = forecastNextMonth(weekly);
    const actualPoints = result.data.filter((d) => d.salesAmount != null);

    expect(actualPoints).toEqual([
      { label: "Jul W3", salesAmount: 500 },
      { label: "Aug W1", salesAmount: 700 },
    ]);
  });
});
