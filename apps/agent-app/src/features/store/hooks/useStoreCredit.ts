import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getSessionStoreById } from "../services/store-services";
import { getCreditEntriesForStore } from "../services/store-credit-service";
import { computeCreditBalance } from "../core/compute-credit-balance";
import type { CreditEntry } from "../types/store-types";

/**
 * Drives the store credit section on the store page: the store's outstanding
 * balance and its credit/payment history, read fresh whenever the visit is
 * confirmed.
 */
export function useStoreCredit() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const [entries, setEntries] = useState<CreditEntry[]>([]);

  const reload = useCallback(() => {
    if (!sessionStoreId) return;
    const sessionStore = getSessionStoreById(sessionStoreId);
    if (!sessionStore) return;
    setEntries(getCreditEntriesForStore(sessionStore.store_id));
  }, [sessionStoreId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { entries, balance: computeCreditBalance(entries), reload };
}
