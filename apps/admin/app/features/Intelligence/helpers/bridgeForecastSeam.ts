import type { ChartPoint, DataPoint } from "../types";
import { DisplayMetric } from "../components/ForecastChart/DisplayMetricToggle";

/** Carries the last actual values (sales and BO) forward as the first
 * forecast values so the solid and dashed segments meet instead of leaving
 * a visual gap. Reads salesUnits/boUnits for the seam when the chart is
 * displaying pieces, otherwise salesAmount/boAmount -- the forecast line
 * itself is already computed in that same unit by forecastNextMonth.
 *
 * The seam point is flagged so the tooltip can hide its duplicated forecast
 * entries -- they're the same numbers as the actuals, not real predictions. */
export function bridgeForecastSeam(
  data: DataPoint[],
  displayMetric: DisplayMetric = "pesos",
): ChartPoint[] {
  const salesKey = displayMetric === "pesos" ? "salesAmount" : "salesUnits";
  const boKey = displayMetric === "pesos" ? "boAmount" : "boUnits";
  return data.map((point, i, all) => {
    const isSeam =
      point[salesKey] != null &&
      point.forecast == null &&
      all[i + 1]?.forecast != null;
    return isSeam
      ? {
          ...point,
          forecast: point[salesKey],
          boForecast: point[boKey],
          isSeam: true,
        }
      : point;
  });
}
