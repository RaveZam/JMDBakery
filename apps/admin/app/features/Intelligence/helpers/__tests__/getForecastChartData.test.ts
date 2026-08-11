import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../forecastNextWeek", () => ({
  forecastNextWeek: vi.fn(() => ({ title: "week" })),
}));
vi.mock("../forecastNextMonth", () => ({
  forecastNextMonth: vi.fn(() => ({ title: "month" })),
}));
vi.mock("../forecastNextYear", () => ({
  forecastNextYear: vi.fn(() => ({ title: "year" })),
}));

import { getForecastChartData } from "../getForecastChartData";
import { forecastNextWeek } from "../forecastNextWeek";
import { forecastNextMonth } from "../forecastNextMonth";
import { forecastNextYear } from "../forecastNextYear";

describe("getForecastChartData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("dispatches yearly to forecastNextYear", () => {
    const points = [{ period: "2026-01-01", total_sales: 1 }];

    const result = getForecastChartData("yearly", points);

    expect(forecastNextYear).toHaveBeenCalledWith(points);
    expect(forecastNextWeek).not.toHaveBeenCalled();
    expect(forecastNextMonth).not.toHaveBeenCalled();
    expect(result).toEqual({ title: "year" });
  });

  test("dispatches monthly to forecastNextMonth", () => {
    const points = [{ period: "2026-01-01", total_sales: 1 }];

    getForecastChartData("monthly", points);

    expect(forecastNextMonth).toHaveBeenCalledWith(points);
    expect(forecastNextYear).not.toHaveBeenCalled();
  });

  test("defaults weekly (and anything else) to forecastNextWeek", () => {
    const points = [{ period: "2026-01-01", total_sales: 1 }];

    getForecastChartData("weekly", points);

    expect(forecastNextWeek).toHaveBeenCalledWith(points);
    expect(forecastNextMonth).not.toHaveBeenCalled();
    expect(forecastNextYear).not.toHaveBeenCalled();
  });
});
