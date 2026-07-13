import { useCallback, useState } from "react";

import { getStoreById } from "../services/store-services";
import { StoreRow } from "../types/db-rows";

export function useStoreDetail() {
  const [store, setStore] = useState<StoreRow | null>(null);

  const openStore = useCallback((id: string) => {
    setStore(getStoreById(id) ?? null);
  }, []);

  const closeStore = useCallback(() => {
    setStore(null);
  }, []);

  return { store, openStore, closeStore };
}
