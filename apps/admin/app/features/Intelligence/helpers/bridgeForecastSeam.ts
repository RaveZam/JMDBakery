import type { ChartPoint, DataPoint } from "../types";

/** Carries the last actual values (sales and BO) forward as the first
 * forecast values so the solid and dashed segments meet instead of leaving
 * a visual gap.
 *
 * The seam point is flagged so the tooltip can hide its duplicated forecast
 * entries -- they're the same numbers as the actuals, not real predictions. */
export function bridgeForecastSeam(data: DataPoint[]): ChartPoint[] {
  return data.map((point, i, all) => {
    const isSeam =
      point.salesAmount != null &&
      point.forecast == null &&
      all[i + 1]?.forecast != null;
    return isSeam
      ? {
          ...point,
          forecast: point.salesAmount,
          boForecast: point.boAmount,
          isSeam: true,
        }
      : point;
  });
}
