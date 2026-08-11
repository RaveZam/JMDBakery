"use client";

import type { ReactElement } from "react";

import { StoresSearchBar } from "./StoresSearchBar";

export function StoresToolbar({
  search,
  onSearchChange,
  visibleCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  visibleCount: number;
  totalCount: number;
}): ReactElement {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <StoresSearchBar search={search} onSearchChange={onSearchChange} />

      {search.trim() && (
        <p className="text-xs text-muted-foreground">
          Showing {visibleCount} of {totalCount} accounts, with their board rank.
        </p>
      )}
    </div>
  );
}
