"use client";

import type { ReactElement } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterRange } from "../types";

function formatCurrencyPHP(value: number): string {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `₱${(value / 1000).toFixed(1)}k`;
  return `₱${value}`;
}

function formatXLabel(dateStr: string, filter: FilterRange): string {
  const date = new Date(dateStr);
  if (filter === "30days") {
    return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-PH", { weekday: "short" });
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

const CHART_TITLE: Record<FilterRange, string> = {
  today: "Sales Today",
  "7days": "Sales — Last 7 Days",
  "30days": "Sales — Last 30 Days",
};

export function SalesLineChart({
  data,
  filter,
}: {
  data: any[];
  filter: FilterRange;
}): ReactElement {
  let chartData: { label: string; sales: number }[];

  if (filter === "today") {
    const salesByHour: Record<number, number> = {};
    for (const row of data) {
      const hour = row.createdAt ? parseInt(row.createdAt.slice(11, 13)) : null;
      if (hour === null) continue;
      salesByHour[hour] = (salesByHour[hour] ?? 0) + row.total;
    }
    chartData = Object.keys(salesByHour)
      .map(Number)
      .sort((a, b) => a - b)
      .map((hour) => ({
        label: formatHourLabel(hour),
        sales: salesByHour[hour],
      }));
  } else {
    const salesByDate: Record<string, number> = {};
    for (const row of data) {
      salesByDate[row.date] = (salesByDate[row.date] ?? 0) + row.total;
    }
    chartData = Object.keys(salesByDate)
      .sort()
      .map((date) => ({
        label: formatXLabel(date, filter),
        sales: salesByDate[date],
      }));
  }

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{CHART_TITLE[filter]}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrencyPHP}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrencyPHP(value), "Sales"]}
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              cursor={{
                stroke: "hsl(var(--primary))",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              fill="hsl(var(--primary))"
              fillOpacity={0.08}
              dot={false}
              activeDot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
