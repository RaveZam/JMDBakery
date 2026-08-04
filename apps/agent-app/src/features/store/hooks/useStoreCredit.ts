import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getSessionStoreById } from "../services/store-services";
import { getCreditEntriesForStore } from "../services/store-credit-service";
import { computeCreditBalance } from "../core/compute-credit-balance";
import { allocateCreditPayments } from "../core/allocate-credit-payments";
import type { CreditEntry } from "../types/store-types";

/**
 * Drives the store credit section on the store page: the store's outstanding
 * balance, how much of each credit is still owed, and the credit/payment
 * history, read fresh whenever the visit is confirmed.
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

  return {
    sessionStoreId,
    entries,
    balance: computeCreditBalance(entries),
    remainingByEntryId: allocateCreditPayments(entries),
    reload,
  };
}
