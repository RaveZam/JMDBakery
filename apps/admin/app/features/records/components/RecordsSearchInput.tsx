"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecordsFilters } from "../context/RecordsFiltersContext";

export function RecordsSearchInput() {
  const { filters } = useRecordsFilters();

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={filters.search}
        onChange={(e) => filters.setSearch(e.target.value)}
        placeholder="Search store…"
        className="pl-9"
        aria-label="Search store"
      />
    </div>
  );
}
