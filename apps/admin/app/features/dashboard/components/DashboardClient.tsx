"use client";

import { TopAgentsChart } from "@/app/features/dashboard/components/TopAgentsChart";
import { KpiStrip } from "@/app/features/dashboard/components/KpiStrip";
import { ProductSoldVsBoChart } from "@/app/features/dashboard/components/ProductSoldVsBoChart";
import { TopProductsSoldTable } from "@/app/features/dashboard/components/TopProductsSoldTable";
import { SalesLineChart } from "@/app/features/dashboard/components/SalesLineChart";
import { DashboardHeader } from "@/app/features/dashboard/components/DashboardHeader";
import { useSalesDataQuery } from "@/app/server/salesData/useSalesDataQuery";
import { useVarianceDataQuery } from "@/app/server/varianceData/useVarianceDataQuery";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDashboardFilter } from "../hooks/useDashboardFilter";

export function DashboardClient() {
  const { data: allData, isLoading } = useSalesDataQuery();
  const { data: allVarianceData, isLoading: isVarianceLoading } =
    useVarianceDataQuery();
  const { filter, data, varianceData, onFilterChange } = useDashboardFilter(
    allData,
    allVarianceData,
  );

  if (isLoading || isVarianceLoading) {
    return (
      <>
        <DashboardHeader filter={filter} onFilterChange={onFilterChange} />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <DashboardHeader filter={filter} onFilterChange={onFilterChange} />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-300 space-y-6">
          <KpiStrip data={data} varianceData={varianceData} filter={filter} />
          <div className="grid gap-6 xl:grid-cols-[7fr_3fr]">
            <SalesLineChart data={data} filter={filter} />
            <TopProductsSoldTable data={data} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <ProductSoldVsBoChart data={data} />
            <TopAgentsChart data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
