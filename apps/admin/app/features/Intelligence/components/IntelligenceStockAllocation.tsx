"use client";

// MOCK DATA — UI only. Suggested loads will come from trailing sell-through later.

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type AllocationRow = {
  product: string;
  current: number;
  suggested: number;
  reason: string;
};

const HARDCODED_DATA: AllocationRow[] = [
  { product: "Pandesal", current: 220, suggested: 250, reason: "Sold out before route end on 4 of last 5 days" },
  { product: "Spanish Bread", current: 180, suggested: 130, reason: "Avg sell-through only 56% — trimming excess" },
  { product: "Ensaymada", current: 120, suggested: 120, reason: "Stable demand, no change recommended" },
  { product: "Cheese Roll", current: 90, suggested: 105, reason: "Consistent 90%+ sell-through this week" },
  { product: "Monay", current: 140, suggested: 95, reason: "Persistent leftovers and rising BO rate" },
];

function AllocationRowItem({ row }: { row: AllocationRow }): ReactElement {
  const delta = row.suggested - row.current;
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const tone =
    delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-muted-foreground";
  return (
    <tr className="border-b last:border-0">
      <td className="px-5 py-3 font-medium">{row.product}</td>
      <td className="px-5 py-3 text-right tabular-nums">{row.current}</td>
      <td className="px-5 py-3 text-right font-semibold tabular-nums">{row.suggested}</td>
      <td className={`px-5 py-3 text-right tabular-nums ${tone}`}>
        <span className="inline-flex items-center justify-end gap-0.5">
          <Icon className="h-3.5 w-3.5" />
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{row.reason}</td>
    </tr>
  );
}

export function IntelligenceStockAllocation(): ReactElement {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Stock allocation recommendation</CardTitle>
        <Badge variant="pending">Mock</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2 font-medium">Product</th>
                <th className="px-5 py-2 text-right font-medium">Current</th>
                <th className="px-5 py-2 text-right font-medium">Suggested</th>
                <th className="px-5 py-2 text-right font-medium">Δ</th>
                <th className="px-5 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {HARDCODED_DATA.map((r) => (
                <AllocationRowItem key={r.product} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
