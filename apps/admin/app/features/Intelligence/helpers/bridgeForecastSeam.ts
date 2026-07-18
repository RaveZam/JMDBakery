import type { ChartPoint, DataPoint } from "../types";

/** Carries the last actual value forward as the first forecast value so the
 * solid and dashed segments meet instead of leaving a visual gap.
 *
 * The seam point is flagged so the tooltip can hide its duplicated forecast
 * entry -- it is the same number as the actual, not a real prediction. */
export function bridgeForecastSeam(data: DataPoint[]): ChartPoint[] {
  return data.map((point, i, all) => {
    const isSeam =
      point.actual != null &&
      point.forecast == null &&
      all[i + 1]?.forecast != null;
    return isSeam ? { ...point, forecast: point.actual, isSeam: true } : point;
  });
}
