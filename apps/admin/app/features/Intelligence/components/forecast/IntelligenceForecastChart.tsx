"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { SalesRecord } from "@/app/server/getBaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ForecastRange } from "../../types/forecast_types";
import { aggregateDailySales, getForecastChartData } from "../../helpers/forecast";

const RANGES: { value: ForecastRange; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function IntelligenceForecastChart({
  data,
}: {
  data: SalesRecord[];
}): ReactElement {
  const [range, setRange] = useState<ForecastRange>("weekly");
  const dailySales = useMemo(() => aggregateDailySales(data), [data]);
  const {
    title,
    data: rawChartData,
    forecastStart,
    forecastEnd,
    yFormatter,
  } = useMemo(
    () => getForecastChartData(range, data, dailySales),
    [range, data, dailySales],
  );

  // Bridge the actual and forecast lines visually by carrying the last actual
  // value forward as the forecast anchor point. Mark it so the tooltip can
  // suppress the duplicate forecast entry at that point.
  const chartData = rawChartData
    .filter((point) => point.actual == null || point.actual > 0)
    .map((point, i, arr) => {
      const isLastActual =
        point.actual != null &&
        point.forecast == null &&
        arr[i + 1]?.forecast != null;
      return isLastActual
        ? { ...point, forecast: point.actual, isBridge: true }
        : point;
    });

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex rounded-md overflow-hidden text-xs font-medium border border-emerald-800">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 transition-colors ${
                  range === r.value
                    ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white"
                    : "bg-background text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.35)"
              />
              <ReferenceArea
                x1={forecastStart}
                x2={forecastEnd}
                fill="rgb(148,163,184)"
                fillOpacity={0.12}
                strokeOpacity={0}
              />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={yFormatter} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const isBridge = payload[0]?.payload?.isBridge;
                  const entries = isBridge
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
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#actualGradient)"
                dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#059669", strokeWidth: 0 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="rgb(100, 116, 139)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
