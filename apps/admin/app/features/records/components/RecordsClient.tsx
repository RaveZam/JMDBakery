"use client";

import { useSalesDataQuery } from "@/app/server/salesData/useSalesDataQuery";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRecordsFilter } from "../hooks/useRecordsFilter";
import { useRecordsDateRange } from "../hooks/useRecordsDateRange";
import { RecordsFiltersProvider } from "../context/RecordsFiltersContext";
import { RecordsHeader } from "./RecordsHeader";
import { RecordsContent } from "./RecordsContent";

export function RecordsClient() {
  const dateRange = useRecordsDateRange();

  const { data: allRecords, isLoading } = useSalesDataQuery(
    dateRange.dateStart,
    dateRange.dateEnd,
  );
  const filter = useRecordsFilter(
    allRecords,
    dateRange.dateStart,
    dateRange.dateEnd,
  );

  // Payments are credit-ledger entries rather than sale lines, so this tab
  // swaps out the table only — the summary above it keeps describing the sales
  // dataset. The ledger is fetched separately, inside PaymentsBody.
  const showPayments = filter.filters.view === "payments";

  return (
    <>
      <RecordsHeader />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <RecordsFiltersProvider value={{ ...filter, dateRange, showPayments }}>
          <RecordsContent />
        </RecordsFiltersProvider>
      )}
    </>
  );
}
