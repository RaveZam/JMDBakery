import { useEffect, useRef } from "react";
import { router, useSegments } from "expo-router";
import { supabase } from "@/src/lib/supabase";
import { initDb } from "@/src/lib/db";
import { runDownloadSync } from "@/src/lib/sync/download";
import { isWifiConnected } from "@/src/lib/network";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SalesDao from "@/src/lib/dao/sales-dao";

type Session = { user: { id: string } } | null;

// getSession() reports session:null both when truly signed out and when a
// token refresh failed due to being offline. Only trust a null session as
// "signed out" while online, so an expired-token agent isn't locked out
// mid-route with no connectivity to sign back in with.
function resolveAuthRedirect(
  session: Session,
  onAuthRoute: boolean,
  offline: boolean,
): "/auth/sign-in" | "/" | null {
  if (!session && !onAuthRoute && !offline) return "/auth/sign-in";
  if (session && onAuthRoute) return "/";
  return null;
}

async function runAuthCheck(
  segments: readonly string[],
  downloaded: React.MutableRefObject<boolean>,
  isMounted: () => boolean,
) {
  await initDb();
  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;
  if (!isMounted()) return;

  if (session && !downloaded.current) {
    downloaded.current = true;
    await runDownloadSync(session.user.id);
  }

  const onAuthRoute = segments[0] === "auth";
  const offline = !session && !(await isWifiConnected());
  const target = resolveAuthRedirect(session, onAuthRoute, offline);
  if (target) router.replace(target);
}

export function useAuthGuard(setCheckingSession: (value: boolean) => void) {
  const segments = useSegments();
  const downloaded = useRef(false);

  useEffect(() => {
    let mounted = true;
    runAuthCheck(segments, downloaded, () => mounted)
      .catch(() => {})
      .finally(() => {
        if (mounted) setCheckingSession(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);
}
