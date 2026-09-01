import { useState } from "react";
import { getOngoingSession } from "../services/ongoing-session-service";
import type { RouteSessionRow } from "@/src/lib/dao/route-sessions-dao";

/**
 * The agent's ongoing route session, read once when the screen mounts.
 *
 * Read in a state initialiser rather than an effect so the answer is there on
 * the first render: the entry screen redirects during render, and a value that
 * arrived a commit later would send the agent home first and correct itself
 * afterwards.
 */
export function useOngoingSession(): RouteSessionRow | null {
  const [ongoing] = useState<RouteSessionRow | null>(getOngoingSession);
  return ongoing;
}
