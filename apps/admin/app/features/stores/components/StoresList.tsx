"use client";

import { useState, type ReactElement } from "react";

import { StoreRankRow } from "./StoreRankRow";
import { StoreDetailModal } from "./StoreDetailModal";
import type { RankedStore } from "../types/store-types";

export function StoresList({
  stores,
  leaderRevenue,
}: {
  stores: RankedStore[];
  leaderRevenue: number;
}): ReactElement {
  const [selectedStore, setSelectedStore] = useState<RankedStore | null>(null);

  return (
    <>
      <div className="rounded-2xl border bg-background px-2 shadow-sm">
        {stores.map((store) => (
          <StoreRankRow
            key={store.id}
            store={store}
            shareOfLeader={store.totalRevenue / leaderRevenue}
            onSelect={setSelectedStore}
          />
        ))}
      </div>

      <StoreDetailModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </>
  );
}
