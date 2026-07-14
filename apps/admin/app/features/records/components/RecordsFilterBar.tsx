"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RECORD_VIEWS, type RecordView } from "../types";

export function RecordsFilterBar({
  view,
  onViewChange,
  search,
  onSearchChange,
}: {
  view: RecordView;
  onViewChange: (value: RecordView) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft dark:shadow-soft-dark">
        {RECORD_VIEWS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onViewChange(value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              view === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search agent, store, product…"
          className="pl-9"
        />
      </div>
    </div>
  );
}
