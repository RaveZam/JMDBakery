"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeTopProducts } from "../helpers/computeTopProducts";
import { formatCurrencyPHP } from "../helpers/formatCurrencyPHP";
import type { ProductSoldRecord } from "../types/dashboard-types";

const COLORS = ["#1f7a44", "#2f9e5e", "#c79a3a", "#dec06a", "#86a06b"];

export function TopProductsSoldTable({ data }: { data: ProductSoldRecord[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const topProducts = computeTopProducts(data);
  const totalQty = topProducts.reduce((sum, d) => sum + d.qty, 0);

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top 5 Products Sold</CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data for this period.
          </p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              {mounted && (
                <PieChart width={200} height={220}>
                  <Pie
                    data={topProducts}
                    dataKey="qty"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} qty`,
                      name,
                    ]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
                    }}
                  />
                </PieChart>
              )}
            </div>

            <div className="flex-1 space-y-2">
              {topProducts.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-xs">{d.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {totalQty > 0 ? ((d.qty / totalQty) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="text-xs tabular-nums font-medium">
                    {formatCurrencyPHP(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
