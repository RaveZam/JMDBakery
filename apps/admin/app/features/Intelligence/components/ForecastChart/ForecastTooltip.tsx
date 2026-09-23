"use client";

import type { TooltipProps } from "recharts";
import { DisplayMetric } from "./DisplayMetricToggle";

// The forecast lines use a light tint so they read as dashed/projected on
// the chart, but that same tint is too faint for text. Forecast labels get
// a darker shade of the same hue instead so they stay readable.
const FORECAST_TEXT_COLOR: Record<string, string> = {
  forecast: "#047857", // dark emerald, matches the sales forecast hue
  boForecast: "#be123c", // dark rose, matches the BO forecast hue
};

export function ForecastTooltip({
  active,
  payload,
  label,
  displayMetric,
}: TooltipProps<number, string> & {
  displayMetric: DisplayMetric;
}): React.ReactElement | null {
  if (!active || !payload?.length) return null;

  // The seam point's forecast values are copies of its actuals, so showing
  // both would read as two separate numbers for the same day.
  const isSeam = payload[0]?.payload?.isSeam;
  const entries = isSeam
    ? payload.filter((p) => p.dataKey !== "forecast" && p.dataKey !== "boForecast")
    : payload;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {entries.map((p) => (
        <p
          key={p.dataKey}
          style={{ color: FORECAST_TEXT_COLOR[p.dataKey as string] ?? p.color }}
        >
          {p.name}: {displayMetric === "pesos" ? "₱" : ""}
          {(p.value as number).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          {displayMetric === "pieces" ? " pieces" : ""}
        </p>
      ))}
    </div>
  );
}
