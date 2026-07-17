import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  getOutbox,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import { insertRouteSession } from "@/src/features/sessions/services/route-session-create-service";
import { insertSessionStore } from "@/src/features/sessions/services/session-store-save-service";

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

function seedSession(sessionId: string): void {
  getDb().withTransactionSync(() => {
    insertRouteSession({
      sessionId,
      routeName: "Test Route",
      sessionDate: "2026-06-30",
      conductedBy: "user-1",
      conductedByName: "Test Agent",
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });
}

test("inserts a session_stores row with province_id", () => {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = "sess-3";
  seedSession(sessionId);

  getDb().withTransactionSync(() => {
    insertSessionStore({
      sessionId,
      store: { id: storeId, province_id: provinceId },
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });

  const row = getDb().getFirstSync<{
    route_session_id: string;
    store_id: string;
    province_id: string;
    visited: number;
  }>("SELECT route_session_id, store_id, province_id, visited FROM session_stores WHERE store_id = ?", [storeId]);
  expect(row).toEqual({
    route_session_id: sessionId,
    store_id: storeId,
    province_id: provinceId,
    visited: 0,
  });
});

test("enqueues a session_store create outbox row with province_id in payload", () => {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = "sess-4";
  seedSession(sessionId);

  getDb().withTransactionSync(() => {
    insertSessionStore({
      sessionId,
      store: { id: storeId, province_id: provinceId },
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });

  const rows = getOutbox("session_store");
  expect(rows).toHaveLength(1);
  const payload = JSON.parse(rows[0].payload);
  expect(payload).toMatchObject({
    route_session_id: sessionId,
    store_id: storeId,
    province_id: provinceId,
    visited: false,
  });
});
