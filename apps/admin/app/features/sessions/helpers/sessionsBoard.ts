import type { SessionRow } from "../types/session-types";

export const SESSION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Running", value: "ongoing" },
  { label: "Completed", value: "completed" },
] as const;

export type SessionFilter = (typeof SESSION_FILTERS)[number]["value"];

export function filterSessions(
  sessions: SessionRow[],
  filter: SessionFilter,
): SessionRow[] {
  if (filter === "all") return sessions;
  return sessions.filter((session) => session.status === filter);
}

export const SESSIONS_PAGE_SIZE = 8;

export type SessionsPage = {
  sessions: SessionRow[];
  page: number;
  totalPages: number;
};

//Yes just paginating the sessions
export function paginateSessions(
  sessions: SessionRow[],
  requestedPage: number,
): SessionsPage {
  const totalPages = Math.max(
    1,
    Math.ceil(sessions.length / SESSIONS_PAGE_SIZE),
  );
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * SESSIONS_PAGE_SIZE;

  return {
    sessions: sessions.slice(start, start + SESSIONS_PAGE_SIZE),
    page,
    totalPages,
  };
}

export type SessionsSummary = {
  total: number;
  running: number;
  visitedStores: number;
  plannedStores: number;
};
//Just takes all the session and summarizes visited and planned stores in the cards
export function summarizeSessions(sessions: SessionRow[]): SessionsSummary {
  const visitedStores = sessions.reduce((sum, s) => sum + s.visitedStores, 0);
  const plannedStores = sessions.reduce((sum, s) => sum + s.totalStores, 0);

  return {
    total: sessions.length,
    running: sessions.filter((s) => s.status === "ongoing").length,
    visitedStores,
    plannedStores,
  };
}

//This is the line progress we have on each session, representing the amount of visited to amount to be visited
const MAX_READABLE_TICKS = 14;
//Set to 14 for now to me the most readable

export type RouteTrack =
  | { kind: "ticks"; ticks: boolean[] }
  | { kind: "meter"; filled: number };

export function routeTrack(visited: number, total: number): RouteTrack {
  if (total === 0) return { kind: "meter", filled: 0 };

  const covered = Math.max(0, Math.min(visited, total));

  if (total > MAX_READABLE_TICKS) {
    return { kind: "meter", filled: covered / total };
  }

  return {
    kind: "ticks",
    ticks: Array.from({ length: total }, (_, i) => i < covered),
  };
}
