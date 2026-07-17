import { useQuery } from "@tanstack/react-query";
import { getSessions } from "./services/sessionsService";
import type { SessionRow } from "./types/session-types";

export const SESSIONS_QUERY_KEY = ["sessions"] as const;

export function useSessionsQuery() {
  const { data, isLoading, error } = useQuery<SessionRow[]>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: getSessions,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
