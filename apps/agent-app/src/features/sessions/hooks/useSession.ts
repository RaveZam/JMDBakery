import { useState, useCallback, useMemo } from "react";
import { useFocusEffect, router } from "expo-router";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import { completeSession } from "../services/sessionLocalService";
import { groupStoresByProvince } from "../core/group-stores-by-province";
import { computeSessionProgress } from "../core/compute-session-progress";
import type { RouteSession, SessionStore } from "../types/session-types";
import { useLocalSearchParams } from "expo-router";

export function useSession() {
  const [session, setSession] = useState<RouteSession | null>(null);
  const [sessionStores, setSessionStores] = useState<SessionStore[]>([]);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  useFocusEffect(
    useCallback(() => {
      if (!sessionId) return;
      const s = RouteSessionsDao.getById(sessionId);
      const stores = SessionStoresDao.getBySessionId(sessionId);
      setSession(s ?? null);
      setSessionStores(stores);
    }, [sessionId]),
  );

  const progress = useMemo(
    () =>
      computeSessionProgress(
        sessionStores.filter((s) => s.visited === 1).length,
        sessionStores.length,
      ),
    [sessionStores],
  );

  const sections = useMemo(
    () => groupStoresByProvince(sessionStores),
    [sessionStores],
  );

  const openEndModal = useCallback(() => setIsEndModalOpen(true), []);
  const closeEndModal = useCallback(() => setIsEndModalOpen(false), []);

  const openStore = useCallback(
    (store: SessionStore) => {
      router.push({
        pathname: "/main/routes/store/[sessionStoreId]",
        params: { sessionStoreId: store.id, sessionId },
      });
    },
    [sessionId],
  );

  const endRoute = useCallback(() => {
    if (!sessionId) return;
    completeSession(sessionId);
    setIsEndModalOpen(false);
    router.push("/main/routes");
  }, [sessionId]);

  const actions = { openStore, endRoute };

  return {
    session: {
      session,
      sections,
      progress,
      isEndModalOpen,
      openEndModal,
      closeEndModal,
      actions,
    },
  };
}
