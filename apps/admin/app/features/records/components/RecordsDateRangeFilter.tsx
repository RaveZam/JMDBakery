"use client";

import { Input } from "@/components/ui/input";
import { useRecordsFilters } from "../context/RecordsFiltersContext";

export function RecordsDateRangeFilter() {
  const { dateRange } = useRecordsFilters();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={dateRange.dateStart}
        onChange={(e) => dateRange.setDateStart(e.target.value)}
        max={dateRange.dateEnd || undefined}
        className="w-auto"
        aria-label="Start date"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={dateRange.dateEnd}
        onChange={(e) => dateRange.setDateEnd(e.target.value)}
        min={dateRange.dateStart || undefined}
        className="w-auto"
        aria-label="End date"
      />
    </div>
  );
}
