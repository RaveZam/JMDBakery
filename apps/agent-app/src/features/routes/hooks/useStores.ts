import { useCallback, useEffect, useState } from "react";

import { getStoresForProvince } from "../services/store-services";
import { Store } from "../types/db-rows";

export function useStores(provinceId: string) {
  const [stores, setStores] = useState<Store[]>([]);

  const loadStores = useCallback(() => {
    if (!provinceId) return;
    setStores(getStoresForProvince(provinceId));
  }, [provinceId]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  return { stores, loadStores };
}
