import type { DataPoint, ForecastChartData } from "../types";
import type { ForecastData } from "@/app/server/salesData/getForecastSeries";
import * as ss from "simple-statistics";
import { MONTH_LABELS, nowInManila, toDateKey, addDays } from "./dateUtils";
import { computeForecastBounds } from "./computeForecastBounds";
import { DisplayMetric } from "../components/ForecastChart/DisplayMetricToggle";

const WEEKS_PER_MONTH = 4;
const ACTUALS_WINDOW_DAYS = 31;
const IN_PROGRESS_WEEK_NOTE =
  "The in-progress week isn't counted in the trend line -- it only holds a few days of sales so far.";

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
  line2: (x: number) => number,
  completedCount: number,
  now: Date,
  currentWeekHasActual: boolean,
): DataPoint[] {
  // The completed weeks occupy x = 0 .. completedCount - 1, so the in-progress
  // week sits at x = completedCount. If it already has sales it is drawn as an
  // actual, so the projection starts at the week after it (x = completedCount +
  // 1); otherwise the in-progress week itself gets the first forecast bar.
  const firstStep = currentWeekHasActual ? 1 : 0;
  const firstWeek = weekOfMonth(now.getUTCDate()) + firstStep;

  // Always project exactly WEEKS_PER_MONTH weeks forward, rolling into as many
  // following months as needed -- not "rest of this month, then one more week".
  const labels: string[] = [];
  let week = firstWeek;
  let monthOffset = 0;
  for (let i = 0; i < WEEKS_PER_MONTH; i++) {
    if (week > WEEKS_PER_MONTH) {
      week = 1;
      monthOffset++;
    }
    const monthName = MONTH_LABELS[(now.getUTCMonth() + monthOffset) % 12];
    labels.push(`${monthName} W${week}`);
    week++;
  }

  return labels.map((label, step) => ({
    label,
    forecast: Math.max(0, Math.round(line(completedCount + firstStep + step))),
    boForecast: Math.max(
      0,
      Math.round(line2(completedCount + firstStep + step)),
    ),
  }));
}

export function forecastNextMonth(
  weekly: ForecastData[],
  displayMetric: DisplayMetric = "pesos",
): ForecastChartData {
  const title = "Sales vs BO Forecast";
  const now = nowInManila();

  // The in-progress week is left out of the regression fit: it holds only a few
  // days of sales in a full-week slot, so fitting it reads as a sharp drop and
  // drags every projection down. It is still drawn as an actual bar below (its
  // sales-so-far); the header carries IN_PROGRESS_WEEK_NOTE to explain the gap.
  const currentWeek = toDateKey(weekStart(now));
  const completedWeeks = weekly.filter((w) => w.period < currentWeek);

  if (completedWeeks.length < 2) {
    return { title, forecastStart: "", forecastEnd: "", yFormatter, data: [] };
  }

  const line = ss.linearRegressionLine(
    ss.linearRegression(
      completedWeeks.map((w, i) => [
        i,
        (displayMetric === "pesos" ? w.total_sales_amount : w.total_sales) ?? 0,
      ]),
    ),
  );

  const line2 = ss.linearRegressionLine(
    ss.linearRegression(
      completedWeeks.map((w, i) => [
        i,
        (displayMetric === "pesos" ? w.total_bo_amount : w.total_bo) ?? 0,
      ]),
    ),
  );

  const windowStart = toDateKey(weekStart(addDays(now, -ACTUALS_WINDOW_DAYS)));
  const currentWeekActual = weekly.find((w) => w.period === currentWeek);

  const data: DataPoint[] = [
    ...weekly
      .filter((w) => w.period >= windowStart && w.period <= currentWeek)
      .map((w) => ({
        label: weekLabel(w.period),
        salesAmount: w.total_sales_amount,
        salesUnits: w.total_sales,
        boAmount: w.total_bo_amount,
        boUnits: w.total_bo,
      })),
    ...projectedWeeks(
      line,
      line2,
      completedWeeks.length,
      now,
      currentWeekActual != null,
    ),
  ];

  return {
    title,
    note: IN_PROGRESS_WEEK_NOTE,
    ...computeForecastBounds(data),
    yFormatter,
    data,
  };
}
