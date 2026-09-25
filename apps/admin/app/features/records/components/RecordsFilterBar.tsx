"use client";

import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { RecordsViewToggle } from "./RecordsViewToggle";
import { RecordsSearchInput } from "./RecordsSearchInput";
import { RecordsExportButton } from "./RecordsExportButton";
import { RecordsDateRangeFilter } from "./RecordsDateRangeFilter";
import { RecordsAttributeFilters } from "./RecordsAttributeFilters";

/** Tabs, search and export on top; the sales-only filters on a row below. */
export function RecordsFilterBar() {
  const { showPayments } = useRecordsFilters();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <RecordsViewToggle />
        <div className="flex flex-1 items-center justify-end gap-3">
          <RecordsSearchInput />
          {/* Payments is a different ledger with no PDF export. */}
          {!showPayments && <RecordsExportButton />}
        </div>
      </div>
      {/* Payments only reads the search box, so these would do nothing there. */}
      {!showPayments && (
        <div className="flex flex-wrap items-center gap-3">
          <RecordsDateRangeFilter />
          <span className="hidden h-6 w-px bg-border lg:block" aria-hidden />
          <RecordsAttributeFilters />
        </div>
      )}
    </div>
  );
}
