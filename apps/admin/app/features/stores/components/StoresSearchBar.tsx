"use client";

import type { ReactElement } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

export function StoresSearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}): ReactElement {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onSearchChange("");
        }}
        placeholder="Search store, city, or province"
        aria-label="Search stores"
        className="bg-card pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
