import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getSessionStoreById } from "../services/store-services";
import type { SessionStoreDetails } from "../types/store-types";

export function useStoreDetails() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const [store, setStore] = useState<SessionStoreDetails | null>(null);

  useEffect(() => {
    if (!sessionStoreId) return;
    setStore(getSessionStoreById(sessionStoreId));
  }, [sessionStoreId]);

  return { store };
}
