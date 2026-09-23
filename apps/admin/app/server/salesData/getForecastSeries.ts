"use server";
import { createClient } from "@/utils/supabase/server";

export type ForecastData = {
  period: string;
  total_sales_amount: number;
  total_sales?: number;
  total_bo?: number;
  total_bo_amount?: number;
};

/** Weekly revenue, trailing 6 months. Backs the next-month forecast. */
export async function getWeeklySales(): Promise<ForecastData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_forecast_weekly_sales");
  if (error) throw new Error(error.message);

  return (data ?? []) as ForecastData[];
}
