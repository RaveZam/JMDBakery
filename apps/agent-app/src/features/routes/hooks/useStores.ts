import { useCallback, useEffect, useState } from "react";

import { getStoresForProvince } from "../services/store-services";
import { StoreRow } from "../types/db-rows";

export function useStores(provinceId: string) {
  const [stores, setStores] = useState<StoreRow[]>([]);

  const loadStores = useCallback(() => {
    if (!provinceId) return;
    setStores(getStoresForProvince(provinceId));
  }, [provinceId]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  return { stores };
}

export default useStores;
