import { useCallback, useEffect, useState } from "react";

import { getProvinces } from "../services/province-save-service";
import { ProvinceRow } from "../types/db-rows";

export function useProvinces(routeId: string) {
  const [provinces, setProvinces] = useState<ProvinceRow[]>([]);

  const loadProvinces = useCallback(() => {
    if (!routeId) return;
    setProvinces(getProvinces(routeId));
  }, [routeId]);

  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  return { provinces };
}

export default useProvinces;
