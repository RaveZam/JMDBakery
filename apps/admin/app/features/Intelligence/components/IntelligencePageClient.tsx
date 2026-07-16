"use client";

import { useMemo } from "react";
import { useSalesData } from "@/app/features/sales-data/SalesDataProvider";
import { parseRecordsFiltersLast30Days } from "@/lib/selectors/filters";
import { computeIntelligenceKpis } from "../helpers/kpis";
import { IntelligenceHeader } from "./IntelligenceHeader";
import { KpiSection } from "./KpiSection";
import { ForecastChart } from "./ForecastChart";

type SearchParams = Record<string, string | string[] | undefined>;

export function IntelligencePageClient({ sp }: { sp: SearchParams }) {
  const { data: allData, isLoading } = useSalesData();
  const filters = parseRecordsFiltersLast30Days(sp);

  // KPIs use a recent 30-day window; the forecast chart uses the full
  // available history so it has enough data to fit trends/seasonality.
  const last30DaysData = useMemo(
    () => allData.filter((r) => r.date >= filters.dateFrom && r.date <= filters.dateTo),
    [allData, filters.dateFrom, filters.dateTo],
  );
  const kpis = useMemo(() => computeIntelligenceKpis(last30DaysData), [last30DaysData]);

  if (isLoading) {
    return (
      <>
        <IntelligenceHeader />
        <div className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="h-8 w-8 rounded-full border-2 border-muted border-t-emerald-600 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <IntelligenceHeader />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <KpiSection kpis={kpis} />
          <ForecastChart records={allData} />
        </div>
      </div>
    </>
  );
}
