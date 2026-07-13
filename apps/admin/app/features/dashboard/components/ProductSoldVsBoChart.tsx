"use client";

import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeProductTotals } from "../helpers/computeProductTotals";
import type { ProductBoRecord } from "../types/dashboard-types";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}): ReactElement | null {
  if (!active || !payload?.length) return null;
  const sold = payload.find((p) => p.name === "Sold")?.value ?? 0;
  const bo = payload.find((p) => p.name === "BO")?.value ?? 0;
  const boRate = sold + bo > 0 ? ((bo / (sold + bo)) * 100).toFixed(1) : "0";
  return (
    <div
      style={{
        fontSize: 12,
        borderRadius: 10,
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
        padding: "8px 12px",
        minWidth: 140,
      }}
    >
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-semibold text-foreground">{p.value} pcs</span>
        </p>
      ))}
      <p className="mt-1 text-muted-foreground">
        BO Rate:{" "}
        <span className="font-semibold text-foreground">{boRate}%</span>
      </p>
    </div>
  );
}

export function ProductSoldVsBoChart({
  data,
}: {
  data: ProductBoRecord[];
}): ReactElement {
  const chartData = computeProductTotals(data);

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sold vs. BO by Product</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data for this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 4, left: -12, bottom: 0 }}
              barCategoryGap="30%"
              barGap={3}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="product"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar
                dataKey="sold"
                name="Sold"
                fill="#1f7a44"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="bo"
                name="BO"
                fill="#d98b3f"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
