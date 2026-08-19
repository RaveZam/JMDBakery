import { supabase } from "@/src/lib/supabase";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import { collapseOngoingSessions } from "../collapse-ongoing-sessions";
import { toLocalSession } from "./core/to-local-session";

/**
 * Full pull of the agent's route sessions, skipping server-side soft deletes.
 * The batch goes through collapseOngoingSessions first: the server allows
 * several 'ongoing' rows but the local DB permits only one, so the extras are
 * demoted before they reach the DAO. Returns the row count, or null on failure.
 */
export async function downloadSessions(): Promise<number | null> {
  const { data, error } = await supabase
    .from("route_sessions")
    .select("*")
    .is("deleted_at", null);
  if (error || !data) {
    console.warn("[download] failed to fetch sessions:", error?.message);
    return null;
  }
  for (const row of collapseOngoingSessions(data)) {
    RouteSessionsDao.upsertSession(toLocalSession(row));
  }
  return data.length;
}
