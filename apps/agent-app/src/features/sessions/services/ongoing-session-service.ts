import RouteSessionsDao, { type RouteSessionRow } from "@/src/lib/dao/route-sessions-dao";

/**
 * Reads the agent's ongoing route session from the local DB, or null when
 * there is none. The DB is the only source here, so this answers the same way
 * offline as it does online.
 *
 * Callers must have run initDb() first — the auth gate does that before any
 * screen mounts.
 */
export function getOngoingSession(): RouteSessionRow | null {
  return RouteSessionsDao.getOngoing() ?? null;
}
