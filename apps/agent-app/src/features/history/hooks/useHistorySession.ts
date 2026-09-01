import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import SalesDao from "@/src/lib/dao/sales-dao";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import StoreCreditDao, {
  type StoreCreditEntryRow,
} from "@/src/lib/dao/store-credit-dao";
import type { LoggedItem } from "@/src/features/store/types/store-types";
import { cancelHistorySession } from "../services/cancel-session-service";
import { groupPaymentsBySessionStore } from "../core/group-payments-by-session-store";
import { sumCollectedPayments } from "../core/sum-collected-payments";

export type HistorySession = {
  sessionId: string;
  data: ReturnType<typeof RouteSessionsDao.getById>;
  inventory: ReturnType<typeof SessionInventoryDao.getBySessionId>;
  stores: ReturnType<typeof SessionStoresDao.getBySessionId>;
  salesByStore: Record<string, LoggedItem[]>;
  // Credit payments taken during this session, keyed by the visit they were
  // collected on.
  paymentsByStore: Record<string, StoreCreditEntryRow[]>;
  collectedTotal: number;
  endingInventory: ReturnType<typeof EndingInventoryDao.getBySessionId>;
  hasEndingInventory: boolean;
  isOngoing: boolean;
  actions: { confirmCancel: () => void };
};

function confirmCancelSession(sessionId: string) {
  Alert.alert(
    "Cancel this session?",
    "This discards the current session. You can start a new one afterward.",
    [
      { text: "Keep session", style: "cancel" },
      {
        text: "Cancel session",
        style: "destructive",
        onPress: () => {
          cancelHistorySession(sessionId);
          router.back();
        },
      },
    ],
  );
}

// The payments collected across the session's visits, both grouped for the
// store cards and totalled for the header.
function useSessionPayments(stores: { id: string }[]) {
  const payments = useMemo(
    () => StoreCreditDao.getPaymentsBySessionStoreIds(stores.map((s) => s.id)),
    [stores],
  );
  return {
    paymentsByStore: useMemo(
      () => groupPaymentsBySessionStore(payments),
      [payments],
    ),
    collectedTotal: sumCollectedPayments(payments),
  };
}

function useSessionDetailData(sessionId: string) {
  const session = useMemo(
    () => (sessionId ? RouteSessionsDao.getById(sessionId) : null),
    [sessionId],
  );
  const inventory = useMemo(
    () => (sessionId ? SessionInventoryDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const stores = useMemo(
    () => (sessionId ? SessionStoresDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const salesByStore = useMemo(() => {
    const map: Record<string, LoggedItem[]> = {};
    for (const s of stores) map[s.id] = SalesDao.getBySessionStoreId(s.id);
    return map;
  }, [stores]);

  const { paymentsByStore, collectedTotal } = useSessionPayments(stores);

  const endingInventory = useMemo(
    () => (sessionId ? EndingInventoryDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const hasEndingInventory = endingInventory.length > 0;

  return {
    session,
    inventory,
    stores,
    salesByStore,
    paymentsByStore,
    collectedTotal,
    endingInventory,
    hasEndingInventory,
  };
}

export function useHistorySession(): { session: HistorySession } {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";

  const { session, ...detail } = useSessionDetailData(sessionId);

  const confirmCancel = useCallback(() => {
    if (!sessionId) return;
    confirmCancelSession(sessionId);
  }, [sessionId]);

  return {
    session: {
      sessionId,
      data: session,
      ...detail,
      isOngoing: session?.status === "ongoing",
      actions: { confirmCancel },
    },
  };
}
