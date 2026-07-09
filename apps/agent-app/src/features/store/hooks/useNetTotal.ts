import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getNetTotalBySessionStore } from "../services/sales-services";
import type { LoggedItem } from "../types/store-types";

// Re-sums via SQL (scoped to this session store) whenever soldItems changes.
export function useNetTotal(soldItems: LoggedItem[]) {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const [netTotal, setNetTotal] = useState(0);

  useEffect(() => {
    if (!sessionStoreId) return;
    setNetTotal(getNetTotalBySessionStore(sessionStoreId));
  }, [sessionStoreId, soldItems]);

  return netTotal;
}
