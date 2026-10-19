"use client";

import { useQuery } from "@tanstack/react-query";
import { getWeeklySales } from "@/app/server/salesData/getForecastSeries";
import { forecastNextMonth } from "../helpers/forecastNextMonth";
import type { ForecastChartData } from "../types";

export type ForecastChartState = {
  isLoading: boolean;
  error: Error | null;
  series: ForecastChartData;
};

export function useForecastChart(): ForecastChartState {
  const { data, isLoading, error } = useQuery({
    queryKey: ["forecast", "weekly"],
    queryFn: () => getWeeklySales(),
  });

  return {
    isLoading,
    error: error as Error | null,
    series: forecastNextMonth(data ?? []),
  };
}
