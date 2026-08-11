"use client";

import { useMemo, useState, type ReactElement } from "react";

import { useStoresQuery } from "./storesQuery";
import {
  computeStoreStats,
  groupStoresByLocation,
} from "./helpers/storeHelpers";
import { rankStores } from "./helpers/rankStores";
import { filterStores } from "./helpers/filterStores";
import { attachMockCredit } from "./mockCredit";
import { StoresBoard } from "./components/StoresBoard";
import { StoresHeader } from "./components/StoresHeader";

export function StoresPage(): ReactElement {
  // Raw DB rows may contain duplicates of the same real-world store (see
  // groupStoresByLocation); merge before rendering so counts/stats below
  // reflect what's actually shown, not raw row count.
  const { data, isLoading } = useStoresQuery();
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => groupStoresByLocation(data), [data]);
  const stats = useMemo(() => computeStoreStats(grouped), [grouped]);

  // Balances are placeholder figures for now; nothing reads the credit ledger.
  // Rank is stamped here, across every store, so search only decides which
  // rows are shown — never what number a row carries.
  const stores = useMemo(() => rankStores(attachMockCredit(grouped)), [grouped]);
  const visibleStores = useMemo(
    () => filterStores(stores, search),
    [stores, search],
  );

  return (
    <>
      <StoresHeader stats={stats} />

      <StoresBoard
        stores={stores}
        visibleStores={visibleStores}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
      />
    </>
  );
}

export default StoresPage;
