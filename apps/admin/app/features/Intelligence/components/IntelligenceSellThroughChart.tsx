"use client";

// MOCK DATA — UI only. Wire to real load vs. sold figures later.

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SellThroughRow = {
  product: string;
  loaded: number;
  sold: number;
};

const HARDCODED_DATA: SellThroughRow[] = [
  { product: "Pandesal", loaded: 220, sold: 210 },
  { product: "Spanish Bread", loaded: 180, sold: 101 },
  { product: "Ensaymada", loaded: 120, sold: 96 },
  { product: "Cheese Roll", loaded: 90, sold: 84 },
  { product: "Monay", loaded: 140, sold: 70 },
];

function toneFor(rate: number): string {
  if (rate >= 85) return "bg-emerald-600";
  if (rate >= 65) return "bg-amber-500";
  return "bg-red-600";
}

export function IntelligenceSellThroughChart(): ReactElement {
  const rows = HARDCODED_DATA.map((r) => ({
    ...r,
    rate: r.loaded === 0 ? 0 : Math.round((r.sold / r.loaded) * 100),
  })).sort((a, b) => b.rate - a.rate);

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Sell-through rate by product</CardTitle>
        <Badge variant="pending">Mock</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((r) => (
          <div key={r.product}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{r.product}</span>
              <span className="text-muted-foreground">
                {r.sold}/{r.loaded} · <span className="font-semibold text-foreground">{r.rate}%</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${toneFor(r.rate)}`}
                style={{ width: `${r.rate}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
