import { useCallback, useEffect, useState } from "react";

import {
  getRoutes,
  createRoute,
  deleteRoute,
} from "../services/route-save-service";
import { Route } from "../types/routes-type";

export function useRoute() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pending, setPending] = useState<Route | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadRoutes = useCallback(() => {
    setRoutes(getRoutes());
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const addRoute = useCallback(
    (name: string) => {
      createRoute(name);
      loadRoutes();
    },
    [loadRoutes],
  );

  const openCreate = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const requestDelete = useCallback((route: Route) => {
    setPending(route);
  }, []);

  const cancelDelete = useCallback(() => {
    setPending(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!pending) return;
    deleteRoute(pending.id);
    setPending(null);
    loadRoutes();
  }, [pending, loadRoutes]);

  return {
    routes,
    create: {
      isModalOpen: createModalOpen,
      openModal: openCreate,
      closeModal: closeCreate,
      addRoute,
    },
    del: {
      routeToDelete: pending,
      requestDelete,
      cancelDelete,
      confirmDelete,
    },
  };
}

export default useRoute;
