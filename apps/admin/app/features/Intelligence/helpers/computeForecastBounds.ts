import { DataPoint } from "../types/forecast_types";

export function computeForecastBounds(data: DataPoint[]): {
  forecastStart: string;
  forecastEnd: string;
} {
  const forecastPoints = data.filter((d) => d.forecast != null);
  return {
    forecastStart: forecastPoints[0]?.label ?? "",
    forecastEnd: forecastPoints[forecastPoints.length - 1]?.label ?? "",
  };
}
