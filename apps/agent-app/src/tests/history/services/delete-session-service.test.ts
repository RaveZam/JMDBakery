import {
  createSchema,
  resetDb,
  seedRouteSession,
  getOutbox,
} from "@/src/test-utils/db-test-helpers";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import {
  deleteHistorySession,
  CompletedSessionNotDeletableError,
} from "@/src/features/history/services/delete-session-service";

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

test("hard-deletes the local row and enqueues an update with deleted_at", () => {
  const sessionId = seedRouteSession();

  deleteHistorySession(sessionId);

  expect(RouteSessionsDao.getById(sessionId)).toBeFalsy();

  const rows = getOutbox("route_session");
  expect(rows).toHaveLength(1);
  expect(rows[0].operation).toBe("update");
  const payload = JSON.parse(rows[0].payload);
  expect(payload.id).toBe(sessionId);
  expect(payload.deleted_at).toEqual(expect.any(String));
});

test("deletes a cancelled session", () => {
  const sessionId = seedRouteSession();
  RouteSessionsDao.cancel(sessionId);

  deleteHistorySession(sessionId);

  expect(RouteSessionsDao.getById(sessionId)).toBeFalsy();
});

test("refuses to delete a completed session", () => {
  const sessionId = seedRouteSession();
  RouteSessionsDao.complete(sessionId);

  expect(() => deleteHistorySession(sessionId)).toThrow(
    CompletedSessionNotDeletableError,
  );
  expect(RouteSessionsDao.getById(sessionId)).toBeTruthy();
  expect(getOutbox("route_session")).toHaveLength(0);
});
