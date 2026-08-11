import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const useSalesDataQuery = vi.fn();
vi.mock("@/app/server/salesData/useSalesDataQuery", () => ({
  useSalesDataQuery: () => useSalesDataQuery(),
}));

vi.mock("../KpiSection", () => ({
  KpiSection: () => <div data-testid="kpi-section" />,
}));
vi.mock("../PerformanceRankings", () => ({
  PerformanceRankings: () => <div data-testid="performance-rankings" />,
}));
vi.mock("../ProductionRecommendations", () => ({
  ProductionRecommendations: () => <div data-testid="production-recommendations" />,
}));
vi.mock("../ForecastChart", () => ({
  ForecastChart: () => <div data-testid="forecast-chart" />,
}));

import { IntelligencePageClient } from "../IntelligencePageClient";

describe("IntelligencePageClient", () => {
  test("shows only the header and a spinner while the dataset is loading", () => {
    // The real hook always returns an array (`data ?? []`), even while loading.
    useSalesDataQuery.mockReturnValue({ data: [], isLoading: true });

    render(<IntelligencePageClient sp={{}} />);

    expect(screen.getByText("Intelligence")).toBeTruthy();
    expect(screen.queryByTestId("kpi-section")).toBeNull();
    expect(screen.queryByTestId("forecast-chart")).toBeNull();
  });

  test("renders every dashboard section once the dataset has loaded", () => {
    useSalesDataQuery.mockReturnValue({ data: [], isLoading: false });

    render(<IntelligencePageClient sp={{}} />);

    expect(screen.getByTestId("kpi-section")).toBeTruthy();
    expect(screen.getByTestId("performance-rankings")).toBeTruthy();
    expect(screen.getByTestId("production-recommendations")).toBeTruthy();
    expect(screen.getByTestId("forecast-chart")).toBeTruthy();
  });
});
