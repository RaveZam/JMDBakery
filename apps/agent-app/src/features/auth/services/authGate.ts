import type { RefObject } from "react";
import { supabase } from "@/src/lib/supabase";
import { initDb } from "@/src/lib/db";
import { runDownloadSync } from "@/src/lib/sync/download";
import { isWifiConnected } from "@/src/lib/network";
import { type AuthGateInput } from "@/src/features/auth/core/resolveAuthRedirect";
import { markSessionVerified, getLastVerifiedAt } from "@/src/lib/device-trust";

/**
 * Checks for session and marks verified in app_settings with a time stamp
 * Runs the download sync if after the checks
 */
export async function readAuthGate(
  pathname: string,
  downloaded: RefObject<boolean>,
): Promise<AuthGateInput> {
  await initDb();
  const { data } = await supabase.auth.getSession();
  const session = data?.session ?? null;

  if (session) {
    markSessionVerified(
      session.user.id,
      session.user.user_metadata?.name ?? session.user.email ?? null,
    );
    if (!downloaded.current) {
      await runDownloadSync(session.user.id);
      downloaded.current = true;
    }
  }

  return {
    hasSession: session !== null,
    onAuthRoute: pathname.startsWith("/auth"),
    // Only worth asking when there's no session — that's the only case where
    // the answer changes the decision.
    online: session !== null ? true : await isWifiConnected(),
    lastVerifiedAt: getLastVerifiedAt(),
    now: new Date(),
  };
}
