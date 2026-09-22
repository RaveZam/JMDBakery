"use client";

import type { TooltipProps } from "recharts";

export function ForecastTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>): React.ReactElement | null {
  if (!active || !payload?.length) return null;

  // The seam point's forecast is a copy of its actual, so showing both would
  // read as two separate numbers for the same day.
  const isSeam = payload[0]?.payload?.isSeam;
  const entries = isSeam
    ? payload.filter((p) => p.dataKey !== "forecast")
    : payload;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {entries.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: ₱
          {(p.value as number).toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </p>
      ))}
    </div>
  );
}
