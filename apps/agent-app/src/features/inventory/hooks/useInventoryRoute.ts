import { useLocalSearchParams } from "expo-router";

import { getRouteName } from "../services/morning-inventory-service";

export function useInventoryRoute() {
  const { routeId, routeName } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
  }>();

  const resolvedName =
    routeName ?? (routeId ? getRouteName(routeId) : null) ?? "Route";

  return { routeId: routeId ?? null, routeName: resolvedName };
}
