import { describe, expect, test, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const getDailySales = vi.fn();
const getWeeklySales = vi.fn();
const getMonthlySales = vi.fn();

vi.mock("@/app/server/salesData/getForecastSeries", () => ({
  getDailySales: (...args: unknown[]) => getDailySales(...args),
  getWeeklySales: (...args: unknown[]) => getWeeklySales(...args),
  getMonthlySales: (...args: unknown[]) => getMonthlySales(...args),
}));

import { useForecastChart } from "../useForecastChart";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useForecastChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDailySales.mockResolvedValue([]);
    getWeeklySales.mockResolvedValue([]);
    getMonthlySales.mockResolvedValue([]);
  });

  test("defaults to the weekly range and fetches daily sales", async () => {
    const { result } = renderHook(() => useForecastChart(), { wrapper });

    expect(result.current.range).toBe("weekly");
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getDailySales).toHaveBeenCalledTimes(1);
    expect(getWeeklySales).not.toHaveBeenCalled();
    expect(getMonthlySales).not.toHaveBeenCalled();
  });

  test("switching to yearly fetches monthly sales instead of daily", async () => {
    const { result } = renderHook(() => useForecastChart(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setRange("yearly"));

    expect(result.current.range).toBe("yearly");
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getMonthlySales).toHaveBeenCalledTimes(1);
  });

  test("switching to monthly fetches weekly sales", async () => {
    const { result } = renderHook(() => useForecastChart(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setRange("monthly"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getWeeklySales).toHaveBeenCalledTimes(1);
  });

  test("surfaces a fetch error instead of throwing", async () => {
    getDailySales.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useForecastChart(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe("network down");
  });

  test("builds the chart series from the fetched points via getForecastChartData", async () => {
    getDailySales.mockResolvedValue([
      { period: "2026-08-14", total_sales: 100 },
    ]);

    const { result } = renderHook(() => useForecastChart(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.series.title).toBe("7-day revenue forecast");
  });
});
