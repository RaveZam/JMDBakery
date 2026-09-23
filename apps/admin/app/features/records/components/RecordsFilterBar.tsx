"use client";

import { RecordsViewToggle } from "./RecordsViewToggle";
import { RecordsDateRangeFilter } from "./RecordsDateRangeFilter";
import { RecordsAttributeFilters } from "./RecordsAttributeFilters";

export function RecordsFilterBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <RecordsViewToggle />
      <div className="flex flex-wrap items-center gap-3">
        <RecordsDateRangeFilter />
        <RecordsAttributeFilters />
      </div>
    </div>
  );
}
