import { createSchema, resetDb, getOutbox } from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { insertRouteSession } from "@/src/features/sessions/services/route-session-create-service";

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

test("inserts a route_sessions row with status ongoing", () => {
  const sessionId = "sess-1";
  getDb().withTransactionSync(() => {
    insertRouteSession({
      sessionId,
      routeName: "North Route",
      sessionDate: "2026-06-30",
      conductedBy: "user-1",
      conductedByName: "Agent One",
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });

  const row = getDb().getFirstSync<{ id: string; status: string }>(
    "SELECT id, status FROM route_sessions WHERE id = ?",
    [sessionId],
  );
  expect(row).toEqual({ id: sessionId, status: "ongoing" });
});

test("enqueues a route_session create outbox row with correct payload", () => {
  const sessionId = "sess-2";
  getDb().withTransactionSync(() => {
    insertRouteSession({
      sessionId,
      routeName: "South Route",
      sessionDate: "2026-06-30",
      conductedBy: "user-1",
      conductedByName: "Agent One",
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });

  const rows = getOutbox("route_session");
  expect(rows).toHaveLength(1);
  const payload = JSON.parse(rows[0].payload);
  expect(payload).toMatchObject({
    id: sessionId,
    route_name: "South Route",
    status: "ongoing",
    conducted_by: "user-1",
    conducted_by_name: "Agent One",
  });
});
