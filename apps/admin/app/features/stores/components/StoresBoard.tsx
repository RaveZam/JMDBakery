"use client";

import type { ReactElement } from "react";

import { StoresList } from "./StoresList";
import { StoresBoardSkeleton } from "./StoresBoardSkeleton";
import { StoresEmptyState } from "./StoresEmptyState";
import { StoresNoResults } from "./StoresNoResults";
import { StoresToolbar } from "./StoresToolbar";
import type { RankedStore } from "../types/store-types";

export function StoresBoard({
  stores,
  visibleStores,
  isLoading,
  search,
  onSearchChange,
}: {
  stores: RankedStore[];
  visibleStores: RankedStore[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}): ReactElement {
  if (isLoading) return <StoresBoardSkeleton />;
  if (stores.length === 0) return <StoresEmptyState />;

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

      {visibleStores.length === 0 ? (
        <StoresNoResults search={search} onClearSearch={() => onSearchChange("")} />
      ) : (
        <StoresList stores={visibleStores} leaderRevenue={leaderRevenue} />
      )}
    </>
  );
}
