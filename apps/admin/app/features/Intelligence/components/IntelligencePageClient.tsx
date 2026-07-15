"use client";

import { useMemo } from "react";
import { getIntelligenceMetrics } from "../helpers/getIntelligenceMetrics";
import { computeProvinceRevenue } from "../helpers/computeProvinceRevenue";
import { IntelligenceHeader } from "./panels/IntelligenceHeader";
import { BusinessHealthOverview } from "./panels/BusinessHealthOverview";
import { NextBestActions } from "./panels/NextBestActions";
import { ForecastSection } from "./panels/ForecastSection";
import { MorningInventoryInsights } from "./panels/MorningInventoryInsights";
import { STATIC_BARANGAYS } from "../constants/staticBarangays";
import { useSalesData } from "@/app/features/sales-data/SalesDataProvider";
import { parseRecordsFiltersLast30Days } from "@/lib/selectors/filters";

type SearchParams = Record<string, string | string[] | undefined>;

export function IntelligencePageClient({ sp }: { sp: SearchParams }) {
  const { data: allData, isLoading } = useSalesData();
  const filters = parseRecordsFiltersLast30Days(sp);

  // getIntelligenceMetrics expects the last-30-days window; province/forecast
  // helpers below intentionally take the full ~6-month allData instead.
  const last30DaysData = useMemo(
    () =>
      allData.filter(
        (r) => r.date >= filters.dateFrom && r.date <= filters.dateTo,
      ),
    [allData, filters.dateFrom, filters.dateTo],
  );
  const provinces = useMemo(() => computeProvinceRevenue(allData), [allData]);
  const metrics = useMemo(
    () => getIntelligenceMetrics(last30DaysData),
    [last30DaysData],
  );

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
          <BusinessHealthOverview metrics={metrics} />
          <NextBestActions />
          <ForecastSection data={allData} />
          <MorningInventoryInsights
            provinces={provinces}
            barangays={STATIC_BARANGAYS}
          />
        </div>
      </div>
    </>
  );
}
