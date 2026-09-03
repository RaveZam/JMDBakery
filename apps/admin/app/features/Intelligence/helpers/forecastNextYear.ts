import type { DataPoint, ForecastChartData, SalesPoint } from "../types";
import { MONTH_LABELS, nowInManila, toDateKey } from "./dateUtils";
import { computeForecastBounds } from "./computeForecastBounds";
import { fitHoltWinters, HOLT_WINTERS_MIN_SEASONS } from "./holtWinters";

const MONTHS_PER_SEASON = 12;
const MONTHS_REQUIRED = MONTHS_PER_SEASON * HOLT_WINTERS_MIN_SEASONS;

const yFormatter = (v: number): string => `₱${(v / 1000).toFixed(0)}k`;

function monthKey(year: number, month: number): string {
  return toDateKey(new Date(Date.UTC(year, month, 1)));
}

function completedMonths(
  revenueByMonth: Map<string, number>,
  year: number,
  month: number,
): number[] {
  const values: number[] = [];
  for (let ago = MONTHS_REQUIRED; ago >= 1; ago--) {
    values.push(revenueByMonth.get(monthKey(year, month - ago)) ?? 0);
  }
  return values;
}

export function forecastNextYear(monthly: SalesPoint[]): ForecastChartData {
  const title = "Yearly Revenue Forecast (Holt-Winters)";

  if (monthly.length < MONTHS_REQUIRED) {
    return { title, forecastStart: "", forecastEnd: "", yFormatter, data: [] };
  }

  const now = nowInManila();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const revenueByMonth = new Map(monthly.map((m) => [m.period, m.total_sales]));
  const holtWintersData = completedMonths(revenueByMonth, year, month);
  const forecastFn = fitHoltWinters(holtWintersData, MONTHS_PER_SEASON);

  // Elapsed months this year are actuals, the current in-progress one included
  // (whatever the RPC has booked so far). The current month is still kept out
  // of the Holt-Winters fit -- completedMonths() only reads the 24 months
  // before it.
  const data: DataPoint[] = [];
  for (let m = 0; m <= month; m++) {
    data.push({
      label: MONTH_LABELS[m],
      actual: revenueByMonth.get(monthKey(year, m)) ?? 0,
    });
  }

  // Forecast the rest of the year. horizon 1 is the current month, one step
  // past the fit window, so next month -- the first month we actually project
  // -- is horizon 2.
  for (let horizon = 1; horizon <= MONTHS_PER_SEASON - month - 1; horizon++) {
    data.push({
      label: MONTH_LABELS[month + horizon],
      forecast: Math.max(0, Math.round(forecastFn(horizon + 1))),
    });
  }

  return { title, ...computeForecastBounds(data), yFormatter, data };
}
