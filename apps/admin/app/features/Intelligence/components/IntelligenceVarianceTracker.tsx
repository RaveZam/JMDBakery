"use client";

// MOCK DATA — UI only. Variance = load − sold − BO (implied remaining) until EOD counts exist.

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type VarianceRow = {
  agent: string;
  route: string;
  loaded: number;
  sold: number;
  bo: number;
};

const HARDCODED_DATA: VarianceRow[] = [
  { agent: "Angel", route: "Cavite North", loaded: 320, sold: 298, bo: 14 },
  { agent: "Ben", route: "Laguna East", loaded: 280, sold: 240, bo: 9 },
  { agent: "Carlo", route: "Batangas Loop", loaded: 250, sold: 205, bo: 31 },
  { agent: "Dina", route: "Rizal South", loaded: 190, sold: 178, bo: 6 },
];

function varianceTone(remaining: number, loaded: number): "success" | "warning" | "pending" {
  const pct = loaded === 0 ? 0 : (remaining / loaded) * 100;
  if (pct <= 5) return "success";
  if (pct <= 15) return "pending";
  return "warning";
}

function VarianceRowItem({ row }: { row: VarianceRow }): ReactElement {
  const remaining = row.loaded - row.sold - row.bo;
  const tone = varianceTone(remaining, row.loaded);
  return (
    <tr className="border-b last:border-0">
      <td className="px-5 py-3 font-medium">{row.agent}</td>
      <td className="px-5 py-3 text-muted-foreground">{row.route}</td>
      <td className="px-5 py-3 text-right tabular-nums">{row.loaded}</td>
      <td className="px-5 py-3 text-right tabular-nums">{row.sold}</td>
      <td className="px-5 py-3 text-right tabular-nums">{row.bo}</td>
      <td className="px-5 py-3 text-right">
        <Badge variant={tone}>{remaining} pcs</Badge>
      </td>
    </tr>
  );
}

export function IntelligenceVarianceTracker(): ReactElement {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Variance tracking by agent</CardTitle>
        <Badge variant="pending">Mock</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-5 py-2 font-medium">Agent</th>
                <th className="px-5 py-2 font-medium">Route</th>
                <th className="px-5 py-2 text-right font-medium">Loaded</th>
                <th className="px-5 py-2 text-right font-medium">Sold</th>
                <th className="px-5 py-2 text-right font-medium">BO</th>
                <th className="px-5 py-2 text-right font-medium">Unaccounted</th>
              </tr>
            </thead>
            <tbody>
              {HARDCODED_DATA.map((r) => (
                <VarianceRowItem key={r.agent} row={r} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-3 text-xs text-muted-foreground">
          Unaccounted = Loaded − Sold − BO. Becomes true variance once end-of-day returns are recorded.
        </p>
      </CardContent>
    </Card>
  );
}
