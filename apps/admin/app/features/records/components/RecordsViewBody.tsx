"use client";

import type { useRecordsFilter } from "../hooks/useRecordsFilter";
import { SalesRecordsBody } from "./SalesRecordsBody";
import { PaymentsBody } from "./PaymentsBody";

/**
 * The table below the filter bar. Payments are ledger entries rather than sale
 * lines, so that tab swaps the whole table out instead of hiding columns.
 */
export function RecordsViewBody({
  showPayments,
  filter,
}: {
  showPayments: boolean;
  filter: ReturnType<typeof useRecordsFilter>;
}) {
  if (showPayments) return <PaymentsBody search={filter.search} />;
  return <SalesRecordsBody filter={filter} />;
}
