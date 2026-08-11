"use client";

import type { ReactElement, ReactNode } from "react";

import { StoresList } from "./StoresList";
import { StoresBoardSkeleton } from "./StoresBoardSkeleton";
import { StoresEmptyState } from "./StoresEmptyState";
import { StoresNoResults } from "./StoresNoResults";
import { StoresToolbar } from "./StoresToolbar";
import type { RankedStore } from "../types/store-types";

// Only the rows scroll. The toolbar above is a sibling of this, so search
// stays in place no matter how far down the board you are.
function ScrollArea({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </div>
  );
}

type StoresBoardProps = {
  stores: RankedStore[];
  visibleStores: RankedStore[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function StoresBoard({
  stores,
  visibleStores,
  isLoading,
  search,
  onSearchChange,
}: StoresBoardProps): ReactElement {
  if (isLoading) {
    return <ScrollArea><StoresBoardSkeleton /></ScrollArea>;
  }
  if (stores.length === 0) {
    return <ScrollArea><StoresEmptyState /></ScrollArea>;
  }

  // Measured against the top earner overall, so a filtered row still shows
  // how it compares to the whole board.
  const leaderRevenue = stores[0]?.totalRevenue || 1;

  return (
    <>
      <StoresToolbar
        search={search}
        onSearchChange={onSearchChange}
        visibleCount={visibleStores.length}
        totalCount={stores.length}
      />

      <ScrollArea>
        {visibleStores.length === 0 ? (
          <StoresNoResults search={search} onClearSearch={() => onSearchChange("")} />
        ) : (
          <StoresList stores={visibleStores} leaderRevenue={leaderRevenue} />
        )}
      </ScrollArea>
    </>
  );
}
