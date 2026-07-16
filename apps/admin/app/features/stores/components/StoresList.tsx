"use client";

import { useState, type ReactElement } from "react";

import { StoreRankRow } from "./StoreRankRow";
import { StoreDetailModal } from "./StoreDetailModal";
import type { GroupedStoreRow } from "../types/store-types";

export function StoresList({ stores }: { stores: GroupedStoreRow[] }): ReactElement {
  const [selectedStore, setSelectedStore] = useState<GroupedStoreRow | null>(null);

  // stores is sorted highest-revenue-first (groupStoresByLocation), so the
  // first row's total is the leader every bar is measured against.
  const leaderRevenue = stores[0]?.totalRevenue || 1;

  return (
    <>
      <div className="rounded-2xl border bg-background px-2 shadow-sm">
        {stores.map((store, index) => (
          <StoreRankRow
            key={store.id}
            store={store}
            rank={index + 1}
            shareOfLeader={store.totalRevenue / leaderRevenue}
            onSelect={setSelectedStore}
          />
        ))}
      </div>

      <StoreDetailModal store={selectedStore} onClose={() => setSelectedStore(null)} />
    </>
  );
}
