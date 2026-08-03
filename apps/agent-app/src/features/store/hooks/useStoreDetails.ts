import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  confirmSessionStoreVisit,
  getSessionStoreById,
} from "../services/store-services";
import type { SessionStoreDetails } from "../types/store-types";

/**
 * Fetches the store details via ID, holds the payment-type choice for this
 * visit (cash/credit), and returns the confirm visit function that marks the
 * visit done and, if credit, records the debt.
 *
 *  @returns store data, payment type state, and the confirm visit function
 */
export function useStoreDetails() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const router = useRouter();
  const [store, setStore] = useState<SessionStoreDetails | null>(null);
  const [paymentType, setPaymentType] = useState<"cash" | "credit">("cash");

  useEffect(() => {
    if (!sessionStoreId) return;
    const details = getSessionStoreById(sessionStoreId);
    setStore(details);
    // A visit already confirmed as credit must reopen showing credit, not
    // silently reset to the cash default.
    if (details) setPaymentType(details.payment_type);
  }, [sessionStoreId]);

  const confirmVisit = (netTotal: number) => {
    if (!sessionStoreId) return;
    confirmSessionStoreVisit(sessionStoreId, paymentType, netTotal);
    router.back();
  };

  return { store, paymentType, setPaymentType, confirmVisit };
}
