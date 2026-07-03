import { useEffect, useRef } from "react";
import { router, useSegments } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { initDb } from "@/src/lib/db";
import { runDownloadSync } from "@/src/lib/sync/download";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SalesDao from "@/src/lib/dao/sales-dao";

export function useAuthGuard(setCheckingSession: (value: boolean) => void) {
  const segments = useSegments();
  const downloaded = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initDb();
        SessionInventoryDao.logAll();
        SalesDao.logAll();

        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!mounted) return;
        if (session && !downloaded.current) {
          downloaded.current = true;
          await runDownloadSync(session.user.id);
        }
        const onAuthRoute = segments[0] === "auth";
        if (!session && !onAuthRoute) {
          router.replace("/auth/sign-in");
        } else if (session && onAuthRoute) {
          router.replace("/");
        }
      } catch {
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);
}
