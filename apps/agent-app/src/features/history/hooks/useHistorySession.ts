import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import SalesDao from "@/src/lib/dao/sales-dao";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import type { LoggedItem } from "@/src/features/store/types/store-types";
import { cancelHistorySession } from "../services/cancel-session-service";

export type HistorySession = {
  sessionId: string;
  data: ReturnType<typeof RouteSessionsDao.getById>;
  inventory: ReturnType<typeof SessionInventoryDao.getBySessionId>;
  stores: ReturnType<typeof SessionStoresDao.getBySessionId>;
  salesByStore: Record<string, LoggedItem[]>;
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

  const endingInventory = useMemo(
    () => (sessionId ? EndingInventoryDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const hasEndingInventory = endingInventory.length > 0;

  return { session, inventory, stores, salesByStore, endingInventory, hasEndingInventory };
}

export function useHistorySession(): { session: HistorySession } {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";

  const { session, inventory, stores, salesByStore, endingInventory, hasEndingInventory } =
    useSessionDetailData(sessionId);

  const isOngoing = session?.status === "ongoing";

  const confirmCancel = useCallback(() => {
    if (!sessionId) return;
    confirmCancelSession(sessionId);
  }, [sessionId]);

  const actions = { confirmCancel };

  return {
    session: {
      sessionId,
      data: session,
      inventory,
      stores,
      salesByStore,
      endingInventory,
      hasEndingInventory,
      isOngoing,
      actions,
    },
  };
}
