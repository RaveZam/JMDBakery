"use client";

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { RankedRevenueList } from "./RankedRevenueList";
import type { GeoRevenueRow } from "../../dashboard/services/revenueGeoService";

export function IntelligenceBottomBarangays({
  barangays,
}: {
  barangays: GeoRevenueRow[];
}): ReactElement {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingDown className="h-4 w-4 text-red-500" />
          Lowest barangays by revenue
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">Past 6 months</p>
      </CardHeader>
      <CardContent>
        <RankedRevenueList
          variant="bottom"
          rows={barangays.map((b) => ({
            key: `${b.province}|${b.barangay}`,
            title: b.barangay,
            caption: b.province || null,
            revenue: b.revenue,
          }))}
          emptyLabel="No barangay revenue recorded in the last 6 months."
        />
      </CardContent>
    </Card>
  );
}
