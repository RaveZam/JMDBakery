"use client";

import { useMemo } from "react";
import { ChefHat } from "lucide-react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { Card } from "@/components/ui/card";
import { computeProductionRecommendations } from "../helpers/computeProductionRecommendations";
import { ProductionRecommendationsTable } from "./ProductionRecommendationsTable";
import { SectionHeading } from "./SectionHeading";

export function ProductionRecommendations({ records }: { records: SalesRecord[] }) {
  const recommendations = useMemo(
    () => computeProductionRecommendations(records),
    [records],
  );

  return (
    <section>
      <SectionHeading
        title="Production recommendation"
        caption="Suggested daily batch per product, averaged from the last 30 days of sales."
      />
      {recommendations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 border-border/70 px-6 py-16 text-center shadow-soft dark:shadow-soft-dark">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">No sales in the last 30 days</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Recommendations appear once there is sales history to average.
          </p>
        </Card>
      ) : (
        <ProductionRecommendationsTable recommendations={recommendations} />
      )}
    </section>
  );
}
