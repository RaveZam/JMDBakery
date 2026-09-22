"use client";

import { useMemo } from "react";
import { useSalesDataQuery } from "@/app/server/salesData/useSalesDataQuery";
import { useCreditPaymentsQuery } from "@/app/server/creditPayments/useCreditPaymentsQuery";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { parseRecordsFiltersLast30Days } from "@/lib/selectors/filters";
import { computeIntelligenceKpis } from "../helpers/kpis";
import { IntelligenceHeader } from "./IntelligenceHeader";
import { KpiSection } from "./KpiSection";
import { ForecastChart } from "./ForecastChart/ForecastChart";
import { ProductionRecommendations } from "./ProductionRecommendations";
import { PerformanceRankings } from "./PerformanceRankings";

type SearchParams = Record<string, string | string[] | undefined>;

export function IntelligencePageClient({ sp }: { sp: SearchParams }) {
  const { data: allData, isLoading } = useSalesDataQuery();
  const { data: payments, isLoading: isPaymentsLoading } =
    useCreditPaymentsQuery();

  const kpis = useMemo(
    () => computeIntelligenceKpis(allData, payments),
    [allData, payments],
  );

  if (isLoading || isPaymentsLoading) {
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
          <PerformanceRankings records={allData} payments={payments} />
          <ProductionRecommendations records={allData} />
          <ForecastChart />
        </div>
      </div>
    </>
  );
}
