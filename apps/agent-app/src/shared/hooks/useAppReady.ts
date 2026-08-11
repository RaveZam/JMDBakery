import { useEffect } from "react";
import { router } from "expo-router";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";

/**
 * Drops an agent back into their ongoing route on launch, so a crash or a
 * force-quit mid-route doesn't cost them their place.
 *
 * Takes the auth guard's verdict rather than re-reading the session: offline
 * with an expired token there is no session, and that's exactly the agent this
 * is for.
 */
export function useAppReady(allowed: boolean) {
  useEffect(() => {
    if (!allowed) return;

    const ongoing = RouteSessionsDao.getOngoing();
    if (!ongoing) return;

    router.replace({
      pathname: ongoing.morning_inventory_finished
        ? "/main/routes/session"
        : "/main/routes/inventory",
      params: { sessionId: ongoing.id, routeName: ongoing.route_name },
    });
  }, [allowed]);
}
