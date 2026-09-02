import type { DataPoint, ForecastChartData, SalesPoint } from "../types";
import * as ss from "simple-statistics";
import { MONTH_LABELS, nowInManila, toDateKey, addDays } from "./dateUtils";
import { computeForecastBounds } from "./computeForecastBounds";

const WEEKS_PER_MONTH = 4;
const ACTUALS_WINDOW_DAYS = 31;

const yFormatter = (v: number): string => `₱${(v / 1000).toFixed(0)}k`;

/** Week-of-month for a day, 1-4. The last week absorbs days 29-31. */
function weekOfMonth(day: number): number {
  return Math.min(WEEKS_PER_MONTH, Math.floor((day - 1) / 7) + 1);
}

function weekStart(date: Date): Date {
  const week = weekOfMonth(date.getUTCDate());
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1 + (week - 1) * 7),
  );
}

function weekLabel(period: string): string {
  const date = new Date(period);
  return `${MONTH_LABELS[date.getUTCMonth()]} W${weekOfMonth(date.getUTCDate())}`;
}

function projectedWeeks(
  line: (x: number) => number,
  fitLength: number,
  now: Date,
  currentWeekShownAsActual: boolean,
): DataPoint[] {
  const monthName = MONTH_LABELS[now.getUTCMonth()];
  const nextMonthName = MONTH_LABELS[(now.getUTCMonth() + 1) % 12];

  // When the current week already has sales on the chart as an actual, start
  // projecting from the next week; otherwise the current week gets a forecast
  // bar like before. The fitted line has the current week at x = fitLength, so
  // the first projected week is one step further out in that case.
  const skip = currentWeekShownAsActual ? 1 : 0;

  const labels: string[] = [];
  for (
    let week = weekOfMonth(now.getUTCDate()) + skip;
    week <= WEEKS_PER_MONTH;
    week++
  ) {
    labels.push(`${monthName} W${week}`);
  }
  labels.push(`${nextMonthName} W1`);

  return labels.map((label, step) => ({
    label,
    forecast: Math.max(0, Math.round(line(fitLength + skip + step))),
  }));
}

export function forecastNextMonth(weekly: SalesPoint[]): ForecastChartData {
  const title = "Next Month Revenue Forecast";
  const now = nowInManila();

  // The in-progress week is partial, so it stays out of the regression fit --
  // a half-finished week drags the slope down. It is still drawn as an actual
  // below when it has sales, so money booked this week doesn't vanish.
  const currentWeek = toDateKey(weekStart(now));
  const fitWeeks = weekly.filter((w) => w.period < currentWeek);

  if (fitWeeks.length < 2) {
    return { title, forecastStart: "", forecastEnd: "", yFormatter, data: [] };
  }

  const line = ss.linearRegressionLine(
    ss.linearRegression(fitWeeks.map((w, i) => [i, w.total_sales])),
  );

  const windowStart = toDateKey(weekStart(addDays(now, -ACTUALS_WINDOW_DAYS)));
  const currentWeekActual = weekly.find((w) => w.period === currentWeek);

  // Appended in chronological order, so no re-sort is needed -- sorting by
  // month name would misorder a December-to-January span. Completed weeks in
  // the trailing window come first, then the current week's sales so far (if
  // any), then the projection.
  const data: DataPoint[] = [
    ...fitWeeks
      .filter((w) => w.period >= windowStart)
      .map((w) => ({ label: weekLabel(w.period), actual: w.total_sales })),
    ...(currentWeekActual
      ? [{ label: weekLabel(currentWeek), actual: currentWeekActual.total_sales }]
      : []),
    ...projectedWeeks(line, fitWeeks.length, now, currentWeekActual != null),
  ];

  return { title, ...computeForecastBounds(data), yFormatter, data };
}
