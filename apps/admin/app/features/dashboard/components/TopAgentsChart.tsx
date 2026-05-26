"use client";

import type { ReactElement } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BAR_COLORS = ["#1f7a44", "#2f9e5e", "#c79a3a", "#dec06a", "#86a06b"];

type SaleRecord = {
  agent: string;
  total: number;
};

function computeTopAgents(data: SaleRecord[]) {
  const totals: { [agent: string]: number } = {};

  for (const row of data) {
    if (!totals[row.agent]) totals[row.agent] = 0;
    totals[row.agent] += row.total;
  }

  return Object.entries(totals)
    .map(([agent, revenue]) => ({ agent, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function formatCurrencyPHP(value: number): string {
  if (value >= 1000) return `₱${(value / 1000).toFixed(1)}k`;
  return `₱${value}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { agent: string; revenue: number } }[];
}): ReactElement | null {
  if (!active || !payload?.length) return null;
  const { agent, revenue } = payload[0].payload;
  return (
    <div
      style={{
        fontSize: 12,
        borderRadius: 10,
        border: "1px solid hsl(var(--border))",
        boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
        padding: "6px 10px",
      }}
    >
      <p className="font-medium">{agent}</p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="font-semibold text-foreground">
          ₱{revenue.toLocaleString()}
        </span>
      </p>
    </div>
  );
}

export function TopAgentsChart({ data }: { data: SaleRecord[] }): ReactElement {
  const chartData = computeTopAgents(data);

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Performing Agents</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={formatCurrencyPHP}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="agent"
                width={52}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={26}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i] ?? "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
