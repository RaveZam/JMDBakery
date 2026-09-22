import { describe, expect, test, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const getWeeklySales = vi.fn();

vi.mock("@/app/server/salesData/getForecastSeries", () => ({
  getWeeklySales: (...args: unknown[]) => getWeeklySales(...args),
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
    getWeeklySales.mockResolvedValue([]);
  });

  test("fetches weekly sales", async () => {
    const { result } = renderHook(() => useForecastChart(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getWeeklySales).toHaveBeenCalledTimes(1);
  });

  test("surfaces a fetch error instead of throwing", async () => {
    getWeeklySales.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useForecastChart(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe("network down");
  });

  test("builds the chart series from the fetched weeks via forecastNextMonth", async () => {
    getWeeklySales.mockResolvedValue([
      { period: "2026-07-06", total_sales: 100 },
      { period: "2026-07-13", total_sales: 120 },
    ]);

    const { result } = renderHook(() => useForecastChart(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.series.title).toBe("Next Month Revenue Forecast");
  });
});
