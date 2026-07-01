import { useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";

export function useAppReady(checkingSession: boolean) {
  useEffect(() => {
    if (checkingSession) return;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const ongoing = RouteSessionsDao.getOngoing();
        if (ongoing) {
          const inventory = SessionInventoryDao.getBySessionId(ongoing.id);
          if (inventory.length === 0) {
            router.replace({
              pathname: "/main/routes/inventory",
              params: { sessionId: ongoing.id, routeName: ongoing.route_name },
            });
          } else {
            router.replace({
              pathname: "/main/routes/session",
              params: { sessionId: ongoing.id, routeName: ongoing.route_name },
            });
          }
        }
      }
    })();
  }, [checkingSession]);
}
