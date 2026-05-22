"use client";

// MOCK DATA — UI only. Wire to per-province sales aggregates later.

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ProvinceRow = {
  province: string;
  revenue: number;
};

const HARDCODED_DATA: ProvinceRow[] = [
  { province: "Cavite", revenue: 48200 },
  { province: "Laguna", revenue: 39100 },
  { province: "Batangas", revenue: 27600 },
  { province: "Rizal", revenue: 18400 },
  { province: "Quezon", revenue: 9300 },
].sort((a, b) => b.revenue - a.revenue);

const max = Math.max(...HARDCODED_DATA.map((d) => d.revenue));

function heatColor(revenue: number): string {
  const t = max === 0 ? 0 : revenue / max;
  if (t >= 0.75) return "rgb(185, 28, 28)";
  if (t >= 0.5) return "rgb(234, 88, 12)";
  if (t >= 0.25) return "rgb(245, 158, 11)";
  return "rgb(148, 163, 184)";
}

export function IntelligenceRouteHotspot(): ReactElement {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Route hotspots by province</CardTitle>
        <Badge variant="pending">Mock</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={HARDCODED_DATA}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="province" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(value: number) => [`₱${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {HARDCODED_DATA.map((d) => (
                  <Cell key={d.province} fill={heatColor(d.revenue)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
