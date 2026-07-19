import { describe, expect, test } from "vitest";
import {
  SESSIONS_PAGE_SIZE,
  filterSessions,
  paginateSessions,
  routeTrack,
  summarizeSessions,
} from "../helpers/sessionsBoard";
import type { SessionRow } from "../types/session-types";

function session(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: "s1",
    routeName: "Cavite North",
    sessionDate: "2026-07-15",
    status: "completed",
    totalStores: 4,
    visitedStores: 4,
    ...overrides,
  };
}

describe("filterSessions", () => {
  const sessions = [
    session({ id: "a", status: "ongoing" }),
    session({ id: "b", status: "completed" }),
  ];

  test("returns every session when the filter is all", () => {
    expect(filterSessions(sessions, "all")).toHaveLength(2);
  });

  test("keeps only the matching status", () => {
    expect(filterSessions(sessions, "ongoing").map((s) => s.id)).toEqual(["a"]);
  });

  test("leaves the original list untouched", () => {
    filterSessions(sessions, "ongoing");
    expect(sessions).toHaveLength(2);
  });
});

describe("paginateSessions", () => {
  const many = Array.from({ length: 20 }, (_, i) =>
    session({ id: `s${i}`, routeName: `Route ${i}` }),
  );

  test("returns a full window for the first page", () => {
    const result = paginateSessions(many, 1);

    expect(result.sessions).toHaveLength(SESSIONS_PAGE_SIZE);
    expect(result.sessions[0].id).toBe("s0");
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  test("windows to the requested page", () => {
    expect(paginateSessions(many, 2).sessions[0].id).toBe("s8");
  });

  test("returns the remainder on the last page", () => {
    expect(paginateSessions(many, 3).sessions).toHaveLength(4);
  });

  test("leaves the original list untouched", () => {
    paginateSessions(many, 2);
    expect(many).toHaveLength(20);
  });
});

describe("paginateSessions edges", () => {
  const many = Array.from({ length: 20 }, (_, i) => session({ id: `s${i}` }));

  test("clamps a page that ran past the end of a narrowed list", () => {
    const result = paginateSessions(many.slice(0, 3), 7);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.sessions).toHaveLength(3);
  });

  test("clamps a page below the first", () => {
    expect(paginateSessions(many, 0).page).toBe(1);
  });

  test("reports one page for an empty list", () => {
    expect(paginateSessions([], 1)).toEqual({
      sessions: [],
      page: 1,
      totalPages: 1,
    });
  });
});

describe("summarizeSessions", () => {
  test("counts sessions, running routes and stops across the board", () => {
    const summary = summarizeSessions([
      session({ id: "a", status: "ongoing", totalStores: 5, visitedStores: 2 }),
      session({ id: "b", status: "completed", totalStores: 5, visitedStores: 5 }),
    ]);

    expect(summary.total).toBe(2);
    expect(summary.running).toBe(1);
    expect(summary.visitedStores).toBe(7);
    expect(summary.plannedStores).toBe(10);
  });

  test("handles an empty board", () => {
    expect(summarizeSessions([])).toEqual({
      total: 0,
      running: 0,
      visitedStores: 0,
      plannedStores: 0,
    });
  });
});

describe("routeTrack", () => {
  test("renders one tick per stop, filled up to the last visit", () => {
    expect(routeTrack(2, 4)).toEqual({
      kind: "ticks",
      ticks: [true, true, false, false],
    });
  });

  test("fills every tick when the whole route was covered", () => {
    expect(routeTrack(3, 3)).toEqual({
      kind: "ticks",
      ticks: [true, true, true],
    });
  });

  test("falls back to a meter once the ticks would be unreadable", () => {
    expect(routeTrack(6, 24)).toEqual({ kind: "meter", filled: 0.25 });
  });

  test("returns an empty meter for a route with no stops", () => {
    expect(routeTrack(0, 0)).toEqual({ kind: "meter", filled: 0 });
  });

  test("clamps a visit count that runs past the planned stops", () => {
    expect(routeTrack(9, 2)).toEqual({ kind: "ticks", ticks: [true, true] });
  });
});
