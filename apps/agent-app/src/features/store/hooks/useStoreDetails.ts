import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  confirmSessionStoreVisit,
  getSessionStoreById,
} from "../services/store-services";
import type { SessionStoreDetails } from "../types/store-types";

export function useStoreDetails() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const router = useRouter();
  const [store, setStore] = useState<SessionStoreDetails | null>(null);

  useEffect(() => {
    if (!sessionStoreId) return;
    setStore(getSessionStoreById(sessionStoreId));
  }, [sessionStoreId]);

  const confirmVisit = () => {
    if (!sessionStoreId) return;
    confirmSessionStoreVisit(sessionStoreId);
    router.back();
  };

  return { store, confirmVisit };
}
