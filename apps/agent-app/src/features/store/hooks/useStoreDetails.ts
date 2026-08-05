import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  confirmSessionStoreVisit,
  getSessionStoreById,
} from "../services/store-services";
import type { SessionStoreDetails } from "../types/store-types";

/**
 * Fetches the store details via ID and returns the confirm visit function that
 * marks the visit done and leaves the screen.
 *
 * The payment type is not here — it lives in useStoreSales, next to the orders
 * it prices, and is persisted as soon as the agent picks it.
 *
 * @returns store data and the confirm visit function
 */
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
