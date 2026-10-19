"use client";

import type { ReactElement } from "react";

import { StoresSearchBar } from "./StoresSearchBar";
import { StoresSortSelect } from "./StoresSortSelect";
import type { StoreSortKey } from "../types/store-types";

// A fixed band under the page header — it sits outside the scrolling rows, so
// search never scrolls out of reach on a long board.
export function StoresToolbar({
  search,
  onSearchChange,
  sortKey,
  onSortChange,
  visibleCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sortKey: StoreSortKey;
  onSortChange: (sortKey: StoreSortKey) => void;
  visibleCount: number;
  totalCount: number;
}): ReactElement {
  return (
    <div className="border-b bg-slate-50/80 px-6 py-3 dark:bg-background/80">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2">
          <StoresSearchBar search={search} onSearchChange={onSearchChange} />
          <StoresSortSelect sortKey={sortKey} onSortChange={onSortChange} />
        </div>

        {search.trim() && (
          <p className="text-xs text-muted-foreground">
            Showing {visibleCount} of {totalCount} accounts, with their board
            rank.
          </p>
        )}
      </div>
    </div>
  );
}
