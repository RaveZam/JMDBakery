"use client";

import { useMemo } from "react";
import { useSalesDataQuery } from "@/app/server/salesData/useSalesDataQuery";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { parseRecordsFiltersLast30Days } from "@/lib/selectors/filters";
import { computeIntelligenceKpis } from "../helpers/kpis";
import { IntelligenceHeader } from "./IntelligenceHeader";
import { KpiSection } from "./KpiSection";
import { ForecastChart } from "./ForecastChart";
import { ProductionRecommendations } from "./ProductionRecommendations";

type SearchParams = Record<string, string | string[] | undefined>;

export function IntelligencePageClient({ sp }: { sp: SearchParams }) {
  const { data: allData, isLoading } = useSalesDataQuery();

  const kpis = useMemo(() => computeIntelligenceKpis(allData), [allData]);

  if (isLoading) {
    return (
      <>
        <IntelligenceHeader />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <IntelligenceHeader />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <KpiSection kpis={kpis} />
          <ProductionRecommendations records={allData} />
          <ForecastChart />
        </div>
      </div>
    </>
  );
}
