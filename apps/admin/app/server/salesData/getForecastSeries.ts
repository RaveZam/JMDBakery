"use server";
import { createClient } from "@/utils/supabase/server";

/** One aggregated bucket of revenue. `period` is the first day of the bucket
 * (day, week, or month depending on which RPC produced it), so points sort
 * chronologically and the label can be derived from the date. */
export type SalesPoint = {
  period: string;
  total_sales: number;
};

/** Weekly revenue, trailing 6 months. Backs the next-month forecast. */
export async function getWeeklySales(): Promise<SalesPoint[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_forecast_weekly_sales");
  if (error) throw new Error(error.message);

  return (data ?? []) as SalesPoint[];
}
