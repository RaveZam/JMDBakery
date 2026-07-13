import { useCallback, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { updateRouteName } from "../services/route-save-service";

export function useRouteName() {
  const { routeId, routeName } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
  }>();
  const [name, setName] = useState(routeName ?? "Route");
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const submit = useCallback(
    (next: string) => {
      const trimmed = next.trim();
      if (!routeId || !trimmed || trimmed === name) {
        setModalOpen(false);
        return;
      }
      updateRouteName(routeId, trimmed);
      setName(trimmed);
      setModalOpen(false);
    },
    [routeId, name],
  );

  return {
    name,
    rename: { isModalOpen: modalOpen, openModal, closeModal, submit },
  };
}
