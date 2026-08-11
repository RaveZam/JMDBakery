import { describe, expect, test } from "vitest";
import { computeForecastBounds } from "../computeForecastBounds";
import type { DataPoint } from "../../types";

describe("computeForecastBounds", () => {
  test("reports the label of the first and last forecast point", () => {
    const data: DataPoint[] = [
      { label: "Jan", actual: 100 },
      { label: "Feb", actual: 110 },
      { label: "Mar", forecast: 120 },
      { label: "Apr", forecast: 130 },
      { label: "May", forecast: 140 },
    ];

    expect(computeForecastBounds(data)).toEqual({
      forecastStart: "Mar",
      forecastEnd: "May",
    });
  });

  test("treats a seam point (actual + forecast) as part of the forecast span", () => {
    const data: DataPoint[] = [
      { label: "Jan", actual: 100 },
      { label: "Feb", actual: 110, forecast: 110 },
      { label: "Mar", forecast: 120 },
    ];

    expect(computeForecastBounds(data).forecastStart).toBe("Feb");
  });

  test("returns empty bounds when there is no forecast data", () => {
    const data: DataPoint[] = [{ label: "Jan", actual: 100 }];

    expect(computeForecastBounds(data)).toEqual({
      forecastStart: "",
      forecastEnd: "",
    });
  });

  test("returns empty bounds for an empty series", () => {
    expect(computeForecastBounds([])).toEqual({
      forecastStart: "",
      forecastEnd: "",
    });
  });
});
