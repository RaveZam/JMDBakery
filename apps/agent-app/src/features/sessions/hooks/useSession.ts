import { useState, useCallback, useMemo } from "react";
import { useFocusEffect, router } from "expo-router";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import {
  completeSession,
  cancelSession,
} from "../services/sessionLocalService";
import { groupStoresByProvince } from "../core/group-stores-by-province";
import { filterStoresByName } from "../core/filter-stores-by-name";
import { computeSessionProgress } from "../core/compute-session-progress";
import type { RouteSession, SessionStore } from "../types/session-types";
import { useLocalSearchParams } from "expo-router";

export function useSession() {
  const [session, setSession] = useState<RouteSession | null>(null);
  const [sessionStores, setSessionStores] = useState<SessionStore[]>([]);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter first, then group, so a province with no matches drops out on its own.
  // progress above stays on the unfiltered list, so the header keeps reporting
  // the whole session while a search narrows the list.
  const sections = useMemo(
    () => groupStoresByProvince(filterStoresByName(sessionStores, searchQuery)),
    [sessionStores, searchQuery],
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

  const cancelRoute = useCallback(() => {
    if (!sessionId) return;
    cancelSession(sessionId);
    setIsEndModalOpen(false);
    router.push("/main/routes");
  }, [sessionId]);

  const actions = { openStore, endRoute, cancelRoute, setSearchQuery };

  return {
    session: {
      session,
      sections,
      progress,
      searchQuery,
      isEndModalOpen,
      openEndModal,
      closeEndModal,
      actions,
    },
  };
}
