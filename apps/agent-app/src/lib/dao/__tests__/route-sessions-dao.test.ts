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
  const a = RouteSessionsDao.insert("R", "2026-07-06", "user-1");
  RouteSessionsDao.complete(a);
  const b = RouteSessionsDao.insert("R", "2026-07-06", "user-1");
  RouteSessionsDao.cancel(b);
  const c = RouteSessionsDao.insert("R", "2026-07-06", "user-1");

  expect(RouteSessionsDao.getOngoing()?.id).toBe(c);
});

test("upsertSession is idempotent and updates on repeated pulls", () => {
  RouteSessionsDao.upsertSession("R", "2026-07-06", "user-1", "completed", "s1");

  // Re-pulling the same id with a changed status must not throw and must update.
  expect(() =>
    RouteSessionsDao.upsertSession("R2", "2026-07-06", "user-1", "cancelled", "s1"),
  ).not.toThrow();

  const row = RouteSessionsDao.getById("s1");
  expect(row?.status).toBe("cancelled");
  expect(row?.route_name).toBe("R2");
});

test("cancel frees the ongoing slot for a new session", () => {
  const a = RouteSessionsDao.insert("R", "2026-07-06", "user-1");
  RouteSessionsDao.cancel(a);

  const b = RouteSessionsDao.insert("R", "2026-07-06", "user-1");
  expect(RouteSessionsDao.getOngoing()?.id).toBe(b);

  const cancelled = RouteSessionsDao.getById(a);
  expect(cancelled?.status).toBe("cancelled");
});
