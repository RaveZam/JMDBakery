import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";
import { getDb } from "@/src/lib/db";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import {
  startSession,
  cancelSession,
  OngoingSessionExistsError,
} from "../sessionLocalService";

jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: "user-1" } } },
      }),
    },
  },
}));

beforeAll(async () => { await createSchema(); });
beforeEach(() => { resetDb(); });

test("creates a route_sessions row with status ongoing", async () => {
  const routeId = seedRoute("Test Route");
  const provinceId = seedProvince(routeId);
  seedStore(provinceId);

  const sessionId = await startSession(routeId, "Test Route");

  const row = getDb().getFirstSync<{ id: string; status: string }>(
    "SELECT id, status FROM route_sessions WHERE id = ?",
    [sessionId],
  );
  expect(row).toEqual({ id: sessionId, status: "ongoing" });
});

test("creates one session_stores row per store with province_id", async () => {
  const routeId = seedRoute("Multi-store Route");
  const prov1 = seedProvince(routeId, "Bulacan");
  const prov2 = seedProvince(routeId, "Rizal");
  const store1 = seedStore(prov1, "Store A");
  const store2 = seedStore(prov2, "Store B");

  const sessionId = await startSession(routeId, "Multi-store Route");

  const rows = getDb().getAllSync<{
    store_id: string;
    province_id: string;
    visited: number;
  }>(
    "SELECT store_id, province_id, visited FROM session_stores WHERE route_session_id = ? ORDER BY store_id",
    [sessionId],
  );

  expect(rows).toEqual(
    expect.arrayContaining([
      { store_id: store1, province_id: prov1, visited: 0 },
      { store_id: store2, province_id: prov2, visited: 0 },
    ]),
  );
});

test("enqueues route_session + session_store outbox rows", async () => {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  seedStore(provinceId);

  const sessionId = await startSession(routeId, "North Route");

  const sessionRows = getOutbox("route_session");
  expect(sessionRows).toHaveLength(1);
  expect(JSON.parse(sessionRows[0].payload)).toMatchObject({
    id: sessionId,
    status: "ongoing",
  });

  const storeRows = getOutbox("session_store");
  expect(storeRows).toHaveLength(1);
  expect(JSON.parse(storeRows[0].payload)).toMatchObject({
    route_session_id: sessionId,
    province_id: provinceId,
    visited: false,
  });
});

test("throws when not authenticated", async () => {
  const { supabase } = require("@/src/lib/supabase");
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: { session: null },
  });

  const routeId = seedRoute();
  await expect(startSession(routeId, "Route")).rejects.toThrow("User not authenticated");
});

test("throws when route has no stores", async () => {
  const routeId = seedRoute("Empty Route");
  await expect(startSession(routeId, "Empty Route")).rejects.toThrow("No stores on this route");
});

test("rejects starting a second session while one is ongoing", async () => {
  const routeId = seedRoute("Route A");
  const provinceId = seedProvince(routeId);
  seedStore(provinceId);
  await startSession(routeId, "Route A");

  await expect(startSession(routeId, "Route A")).rejects.toBeInstanceOf(
    OngoingSessionExistsError,
  );
});

test("cancelling an ongoing session lets a new one start", async () => {
  const routeId = seedRoute("Route B");
  const provinceId = seedProvince(routeId);
  seedStore(provinceId);
  const first = await startSession(routeId, "Route B");

  cancelSession(first);

  const second = await startSession(routeId, "Route B");
  expect(RouteSessionsDao.getOngoing()?.id).toBe(second);
});

test("cancelSession enqueues a route_session upsert with cancelled status", async () => {
  const routeId = seedRoute("Route C");
  const provinceId = seedProvince(routeId);
  seedStore(provinceId);
  const id = await startSession(routeId, "Route C");

  cancelSession(id);

  const out = latestOutboxFor(id);
  expect(out?.entity_type).toBe("route_session");
  expect(out?.operation).toBe("create");
  expect(out?.payload).toMatchObject({ id, status: "cancelled" });
});
