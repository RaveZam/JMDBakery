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
import type { ChartPoint, ForecastChartData } from "../../types";
import { ForecastTooltip } from "./ForecastTooltip";
import { DisplayMetric } from "./DisplayMetricToggle";

// Sales and backorders each get one hue: a saturated shade for the actual
// line/area, and a lighter dashed tint of the same hue for its forecast.
// That's what lets a glance separate "what happened" from "what's projected"
// without losing which series is which.
const SALES_COLOR = "#059669"; // emerald-600
const SALES_FORECAST_COLOR = "#6ee7b7"; // emerald-300
const BO_COLOR = "#e11d48"; // rose-600
const BO_FORECAST_COLOR = "#fda4af"; // rose-300

const SALES_FILL_ID = "intelligenceSalesFill";
const BO_FILL_ID = "intelligenceBoFill";

// The forecast lines use a light tint so they read as dashed/projected, but
// that tint is too faint for legend text. Give just those labels a darker
// shade of the same hue instead.
const LEGEND_TEXT_COLOR: Record<string, string> = {
  "Sales Forecast": "#047857",
  "BO Forecast": "#be123c",
};

function legendLabel(value: string): React.ReactNode {
  const color = LEGEND_TEXT_COLOR[value];
  return color ? <span style={{ color }}>{value}</span> : value;
}

const CHART_MARGIN = { top: 8, right: 8, left: 8, bottom: 8 };
const AXIS_TICK = { fontSize: 11 };

// Series styling is hoisted so the chart tree below stays readable. These are
// spread onto Recharts elements, which is safe -- Recharts keys off the
// element type, not how its props were supplied.
const SALES_STYLE = {
  stroke: SALES_COLOR,
  strokeWidth: 2,
  fill: `url(#${SALES_FILL_ID})`,
  dot: { r: 3, fill: SALES_COLOR, strokeWidth: 0 },
  activeDot: { r: 5, fill: "#047857", strokeWidth: 0 },
  connectNulls: false,
} as const;

const BO_STYLE = {
  stroke: BO_COLOR,
  strokeWidth: 2,
  fill: `url(#${BO_FILL_ID})`,
  dot: { r: 3, fill: BO_COLOR, strokeWidth: 0 },
  activeDot: { r: 5, fill: "#be123c", strokeWidth: 0 },
  connectNulls: false,
} as const;

const SALES_FORECAST_STYLE = {
  stroke: SALES_FORECAST_COLOR,
  strokeWidth: 2,
  strokeDasharray: "6 4",
  dot: { r: 3, fill: SALES_FORECAST_COLOR, strokeWidth: 0 },
  connectNulls: false,
} as const;

const BO_FORECAST_STYLE = {
  stroke: BO_FORECAST_COLOR,
  strokeWidth: 2,
  strokeDasharray: "6 4",
  dot: { r: 3, fill: BO_FORECAST_COLOR, strokeWidth: 0 },
  connectNulls: false,
} as const;

function AreaFillGradient({
  id,
  color,
}: {
  id: string;
  color: string;
}): React.ReactElement {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.35} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  );
}

export function ForecastPlot({
  series,
  data,
  displayMetric,
}: {
  series: ForecastChartData;
  data: ChartPoint[];
  displayMetric: DisplayMetric;
}): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={CHART_MARGIN}>
        <defs>
          <AreaFillGradient id={SALES_FILL_ID} color={SALES_COLOR} />
          <AreaFillGradient id={BO_FILL_ID} color={BO_COLOR} />
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
        {/* Shades the projected span so forecast reads as distinct from actual. */}
        <ReferenceArea
          x1={series.forecastStart}
          x2={series.forecastEnd}
          fill="rgb(148,163,184)"
          fillOpacity={0.12}
          stroke="none"
        />
        <XAxis dataKey="label" tick={AXIS_TICK} />
        <YAxis tick={AXIS_TICK} tickFormatter={series.yFormatter} />
        <Tooltip content={<ForecastTooltip displayMetric={displayMetric} />} />
        <Legend formatter={legendLabel} />
        <Area
          type="monotone"
          dataKey={displayMetric === "pesos" ? "salesAmount" : "salesUnits"}
          name={
            displayMetric === "pesos"
              ? "Sales Peso Amount"
              : "Sales Pieces Amount"
          }
          {...SALES_STYLE}
        />
        <Area
          type="monotone"
          dataKey={displayMetric === "pesos" ? "boAmount" : "boUnits"}
          name={
            displayMetric === "pesos" ? "BO Peso Amount" : "BO Pieces Amount"
          }
          {...BO_STYLE}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Sales Forecast"
          {...SALES_FORECAST_STYLE}
        />
        <Line
          type="monotone"
          dataKey="boForecast"
          name="BO Forecast"
          {...BO_FORECAST_STYLE}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
