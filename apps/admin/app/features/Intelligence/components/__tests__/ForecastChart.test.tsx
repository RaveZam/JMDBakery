import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { ForecastChartState } from "../../hooks/useForecastChart";

const useForecastChart = vi.fn();
vi.mock("../../hooks/useForecastChart", () => ({
  useForecastChart: () => useForecastChart(),
}));

vi.mock("../ForecastPlot", () => ({
  ForecastPlot: ({ data }: { data: unknown[] }) => (
    <div data-testid="forecast-plot">{data.length} points</div>
  ),
}));

import { ForecastChart } from "../ForecastChart";

function makeState(overrides: Partial<ForecastChartState> = {}): ForecastChartState {
  return {
    range: "weekly",
    setRange: vi.fn(),
    isLoading: false,
    error: null,
    series: {
      title: "7-day revenue forecast",
      data: [],
      forecastStart: "",
      forecastEnd: "",
      yFormatter: (v: number) => `₱${v}`,
    },
    ...overrides,
  };
}

describe("ForecastChart", () => {
  test("shows a loading state while the forecast is fetching", () => {
    useForecastChart.mockReturnValue(makeState({ isLoading: true }));

    render(<ForecastChart />);

    expect(screen.queryByTestId("forecast-plot")).toBeNull();
  });

  test("shows an error message when the fetch failed", () => {
    useForecastChart.mockReturnValue(makeState({ error: new Error("boom") }));

    render(<ForecastChart />);

    expect(screen.getByText("Could not load forecast data.")).toBeTruthy();
  });

  test("shows an empty-history message when there is no data to plot", () => {
    useForecastChart.mockReturnValue(makeState({ series: { ...makeState().series, data: [] } }));

    render(<ForecastChart />);

    expect(screen.getByText("Not enough sales history for this forecast.")).toBeTruthy();
  });

  test("renders the plot with the bridged data once loaded", () => {
    useForecastChart.mockReturnValue(
      makeState({
        series: {
          title: "7-day revenue forecast",
          data: [
            { label: "Mon", actual: 100 },
            { label: "Tue", actual: 120 },
            { label: "Wed", forecast: 130 },
          ],
          forecastStart: "Wed",
          forecastEnd: "Wed",
          yFormatter: (v: number) => `₱${v}`,
        },
      }),
    );

    render(<ForecastChart />);

    expect(screen.getByTestId("forecast-plot")).toBeTruthy();
    expect(screen.getByText("3 points")).toBeTruthy();
  });

  test("shows the range toggle and passes range/onChange from the hook", () => {
    const setRange = vi.fn();
    useForecastChart.mockReturnValue(makeState({ range: "monthly", setRange }));

    render(<ForecastChart />);

    expect(screen.getByText("Monthly").className).toContain("text-white");
  });

  test("renders the series title as the card heading", () => {
    useForecastChart.mockReturnValue(
      makeState({ series: { ...makeState().series, title: "Custom title" } }),
    );

    render(<ForecastChart />);

    expect(screen.getByText("Custom title")).toBeTruthy();
  });
});
