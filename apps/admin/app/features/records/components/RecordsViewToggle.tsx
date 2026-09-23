"use client";

import { RECORD_VIEWS } from "../types";
import { useRecordsFilters } from "../context/RecordsFiltersContext";

export function RecordsViewToggle() {
  const { filters } = useRecordsFilters();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft dark:shadow-soft-dark">
      {RECORD_VIEWS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => filters.setView(value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            filters.view === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
