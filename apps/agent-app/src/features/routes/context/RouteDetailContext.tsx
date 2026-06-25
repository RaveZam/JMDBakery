import { createContext, ReactNode } from "react";
import { useLocalSearchParams } from "expo-router";
import { useRouteEditing } from "../hooks/useRouteEditing";
import { useProvinces } from "../hooks/useProvinces";
import { useRouteModals } from "../hooks/useRouteModals";
import { usePlanRoute } from "@/src/features/sessions/hooks/usePlanRoute";

export type RouteDetailContextValue = ReturnType<typeof useRouteEditing> &
  ReturnType<typeof useProvinces> &
  ReturnType<typeof useRouteModals> &
  Pick<ReturnType<typeof usePlanRoute>, "createSession"> & {
    routeId: string | undefined;
  };

export const RouteDetailContext = createContext<RouteDetailContextValue | null>(
  null,
);

export function RouteDetailProvider({ children }: { children: ReactNode }) {
  const editing = useRouteEditing();
  const provinces = useProvinces();
  const modals = useRouteModals();

  const { routeId: routeIdParam } = useLocalSearchParams<{ routeId?: string }>();
  const routeId =
    typeof routeIdParam === "string" ? routeIdParam : undefined;
  const { createSession } = usePlanRoute(routeId ?? "", editing.routeName);

  const value: RouteDetailContextValue = {
    ...editing,
    ...provinces,
    ...modals,
    createSession,
    routeId,
  };

  return (
    <RouteDetailContext.Provider value={value}>
      {children}
    </RouteDetailContext.Provider>
  );
}
