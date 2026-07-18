"use server";
import { createClient } from "@/utils/supabase/server";

/** One aggregated bucket of revenue. `period` is the first day of the bucket
 * (day, week, or month depending on which RPC produced it), so points sort
 * chronologically and the label can be derived from the date. */
export type SalesPoint = {
  period: string;
  total_sales: number;
};

async function callForecastRpc(
  fn:
    | "get_forecast_daily_sales"
    | "get_forecast_weekly_sales"
    | "get_forecast_monthly_sales",
): Promise<SalesPoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(fn);
  if (error) throw new Error(error.message);

  return (data ?? []) as unknown as SalesPoint[];
}

/** Daily revenue, trailing 30 days. Backs the 7-day forecast. */
export const getDailySales = async (): Promise<SalesPoint[]> =>
  callForecastRpc("get_forecast_daily_sales");

/** Weekly revenue, trailing 6 months. Backs the next-month forecast. */
export const getWeeklySales = async (): Promise<SalesPoint[]> =>
  callForecastRpc("get_forecast_weekly_sales");

/** Monthly revenue, trailing 24 months. Backs the yearly Holt-Winters
 * forecast, which needs two full seasons to fit. */
export const getMonthlySales = async (): Promise<SalesPoint[]> =>
  callForecastRpc("get_forecast_monthly_sales");
