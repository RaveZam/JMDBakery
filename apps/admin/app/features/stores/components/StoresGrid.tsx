"use client";

import { useState, type ReactElement } from "react";

import { StoreCard } from "./StoreCard";
import { StoreDetailModal } from "./StoreDetailModal";
import type { StoreRow } from "../types/store-types";

export function StoresGrid({ stores }: { stores: StoreRow[] }): ReactElement {
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} onSelect={setSelectedStore} />
        ))}
      </div>

      <StoreDetailModal
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </>
  );
}
