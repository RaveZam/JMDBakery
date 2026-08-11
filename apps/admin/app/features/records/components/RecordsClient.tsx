"use client";

import { useSalesDataQuery } from "@/app/server/salesData/useSalesDataQuery";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRecordsFilter } from "../hooks/useRecordsFilter";
import { RecordsHeader } from "./RecordsHeader";
import { RecordsContent } from "./RecordsContent";

export function RecordsClient() {
  const { data: allRecords, isLoading } = useSalesDataQuery();
  const filter = useRecordsFilter(allRecords);

  // Payments are credit-ledger entries rather than sale lines, so this tab
  // swaps out the table only — the summary above it keeps describing the sales
  // dataset. The ledger is fetched separately, inside PaymentsBody.
  const showPayments = filter.view === "payments";

  return (
    <>
      <RecordsHeader />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <RecordsContent filter={filter} showPayments={showPayments} />
      )}
    </>
  );
}
