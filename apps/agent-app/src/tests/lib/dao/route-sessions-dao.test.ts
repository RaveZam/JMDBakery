import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";

beforeAll(async () => {
  await createSchema();
});
beforeEach(() => {
  resetDb();
});

test("getOngoing returns nothing when there is no ongoing session", () => {
  expect(RouteSessionsDao.getOngoing()).toBeFalsy();
});

test("getOngoing ignores completed and cancelled sessions", () => {
  const a = RouteSessionsDao.insert({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    createdAt: "2026-07-06T00:00:00Z",
  });
  RouteSessionsDao.complete(a);
  const b = RouteSessionsDao.insert({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    createdAt: "2026-07-06T00:00:00Z",
  });
  RouteSessionsDao.cancel(b);
  const c = RouteSessionsDao.insert({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    createdAt: "2026-07-06T00:00:00Z",
  });

  expect(RouteSessionsDao.getOngoing()?.id).toBe(c);
});

test("upsertSession is idempotent and updates on repeated pulls", () => {
  RouteSessionsDao.upsertSession({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    status: "completed",
    createdAt: "2026-07-06T00:00:00Z",
    id: "s1",
  });

  // Re-pulling the same id with a changed status must not throw and must update.
  expect(() =>
    RouteSessionsDao.upsertSession({
      routeName: "R2",
      sessionDate: "2026-07-06",
      conductedBy: "user-1",
      status: "cancelled",
      createdAt: "2026-07-06T00:00:00Z",
      id: "s1",
    }),
  ).not.toThrow();

  const row = RouteSessionsDao.getById("s1");
  expect(row?.status).toBe("cancelled");
  expect(row?.route_name).toBe("R2");
});

test("cancel frees the ongoing slot for a new session", () => {
  const a = RouteSessionsDao.insert({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    createdAt: "2026-07-06T00:00:00Z",
  });
  RouteSessionsDao.cancel(a);

  const b = RouteSessionsDao.insert({
    routeName: "R",
    sessionDate: "2026-07-06",
    conductedBy: "user-1",
    createdAt: "2026-07-06T00:00:00Z",
  });
  expect(RouteSessionsDao.getOngoing()?.id).toBe(b);

  const cancelled = RouteSessionsDao.getById(a);
  expect(cancelled?.status).toBe("cancelled");
});
