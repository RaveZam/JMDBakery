"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from "recharts";
import type { ChartPoint, ForecastChartData } from "../types";
import { ForecastTooltip } from "./ForecastTooltip";

const ACTUAL_COLOR = "#10b981";
const FORECAST_COLOR = "rgb(100, 116, 139)";
const FILL_ID = "intelligenceActualFill";

const CHART_MARGIN = { top: 8, right: 8, left: 8, bottom: 8 };
const AXIS_TICK = { fontSize: 11 };

// Series styling is hoisted so the chart tree below stays readable. These are
// spread onto Recharts elements, which is safe -- Recharts keys off the
// element type, not how its props were supplied.
const ACTUAL_STYLE = {
  stroke: ACTUAL_COLOR,
  strokeWidth: 2,
  fill: `url(#${FILL_ID})`,
  dot: { r: 3, fill: ACTUAL_COLOR, strokeWidth: 0 },
  activeDot: { r: 5, fill: "#059669", strokeWidth: 0 },
  connectNulls: false,
} as const;

const FORECAST_STYLE = {
  stroke: FORECAST_COLOR,
  strokeWidth: 2,
  strokeDasharray: "5 5",
  dot: { r: 3 },
  connectNulls: false,
} as const;

function ActualFillGradient(): React.ReactElement {
  return (
    <linearGradient id={FILL_ID} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={ACTUAL_COLOR} stopOpacity={0.35} />
      <stop offset="100%" stopColor={ACTUAL_COLOR} stopOpacity={0} />
    </linearGradient>
  );
}

export function ForecastPlot({
  series,
  data,
}: {
  series: ForecastChartData;
  data: ChartPoint[];
}): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={CHART_MARGIN}>
        <defs>
          <ActualFillGradient />
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" />
        {/* Shades the projected span so forecast reads as distinct from actual. */}
        <ReferenceArea
          x1={series.forecastStart}
          x2={series.forecastEnd}
          fill="rgb(148,163,184)"
          fillOpacity={0.12}
          strokeOpacity={0}
        />
        <XAxis dataKey="label" tick={AXIS_TICK} />
        <YAxis tick={AXIS_TICK} tickFormatter={series.yFormatter} />
        <Tooltip content={<ForecastTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="actual" name="Actual" {...ACTUAL_STYLE} />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          {...FORECAST_STYLE}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
