import { useCallback, useEffect, useState } from "react";

import { getSalesBySessionStore } from "../services/sales-services";
import type { LoggedItem } from "../types/store-types";

export function useGetSessionStoreSales(sessionStoreId: string) {
  const [soldItems, setSoldItems] = useState<LoggedItem[]>([]);

  const reload = useCallback(() => {
    if (!sessionStoreId) return;
    setSoldItems(getSalesBySessionStore(sessionStoreId));
  }, [sessionStoreId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { soldItems, reload };
}
