"use client";

import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { SalesRecordsBody } from "./SalesRecordsBody";
import { PaymentsBody } from "./PaymentsBody";

/**
 * The table below the filter bar. Payments are ledger entries rather than sale
 * lines, so that tab swaps the whole table out instead of hiding columns.
 */
export function RecordsViewBody() {
  const { showPayments } = useRecordsFilters();

  if (showPayments) return <PaymentsBody />;
  return <SalesRecordsBody />;
}
