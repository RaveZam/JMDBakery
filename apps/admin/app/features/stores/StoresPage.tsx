"use client";

import { useMemo, type ReactElement } from "react";

import { useStoresQuery } from "./storesQuery";
import { computeStoreStats, groupStoresByLocation } from "./helpers/storeHelpers";
import { StoresList } from "./components/StoresList";
import { StoresBoardSkeleton } from "./components/StoresBoardSkeleton";
import { StoresEmptyState } from "./components/StoresEmptyState";
import { StoresHeader } from "./components/StoresHeader";

export function StoresPage(): ReactElement {
  // Raw DB rows may contain duplicates of the same real-world store (see
  // groupStoresByLocation); merge before rendering so counts/stats below
  // reflect what's actually shown, not raw row count.
  const { data, isLoading } = useStoresQuery();
  const stores = useMemo(() => groupStoresByLocation(data), [data]);
  const stats = useMemo(() => computeStoreStats(stores), [stores]);

  return (
    <>
      <StoresHeader stats={stats} />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {isLoading ? (
            <StoresBoardSkeleton />
          ) : stores.length === 0 ? (
            <StoresEmptyState />
          ) : (
            <StoresList stores={stores} />
          )}
        </div>
      </div>
    </>
  );
}

export default StoresPage;
