"use client";

import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { RecordsExportButton } from "./RecordsExportButton";
import { RecordsSummary } from "./RecordsSummary";
import { RecordsFilterBar } from "./RecordsFilterBar";

/** Export button, summary, and filter bar above the records table. */
export function RecordsToolbar() {
  const { showPayments } = useRecordsFilters();

  return (
    <>
      {/* PDF export is a sales-records concept -- Payments is a different
          ledger with no export button of its own. */}
      {!showPayments && <RecordsExportButton />}
      {/* The summary is about the sales dataset and stays put across tabs,
          so switching to Payments only swaps the table below. */}
      <RecordsSummary />
      <RecordsFilterBar />
    </>
  );
}
