// Integration: real SQLite (node:sqlite) + real outbox. Asserts the local
// write AND the enqueued outbox row in the same transaction. Stops at the
// outbox — pushing to Supabase (runOutboxSync) is intentionally out of scope.
import {
  createRoute,
  updateRouteName,
  deleteRoute,
  getRoutes,
} from "../route-save-service";
import StoresDao from "@/src/lib/dao/store-dao";
import ProvincesDao from "@/src/lib/dao/province-dao";
import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
});

describe("createRoute (integration: SQLite + outbox)", () => {
  test("inserts the route and enqueues a matching create outbox row", () => {
    const id = createRoute("North Route");

    expect(getRoutes()).toEqual([{ id, name: "North Route" }]);
    expect(latestOutboxFor(id)).toEqual({
      entity_type: "route",
      operation: "create",
      payload: { id, name: "North Route" },
    });
  });

  test("trims surrounding whitespace before persisting and enqueueing", () => {
    const id = createRoute("  South Route  ");

    expect(getRoutes()).toEqual([{ id, name: "South Route" }]);
    expect(latestOutboxFor(id)?.payload).toEqual({ id, name: "South Route" });
  });

  test("rejects a blank name and writes nothing to either table", () => {
    expect(() => createRoute("   ")).toThrow("Route name is required.");

    expect(getRoutes()).toEqual([]);
    expect(getOutbox()).toEqual([]);
  });
});

describe("updateRouteName (integration: SQLite + outbox)", () => {
  test("renames the route and enqueues an update outbox row", () => {
    const id = seedRoute("Old Name");

    updateRouteName(id, "  New Name  ");

    expect(getRoutes()).toEqual([{ id, name: "New Name" }]);
    expect(latestOutboxFor(id)).toEqual({
      entity_type: "route",
      operation: "update",
      payload: { name: "New Name" },
    });
  });

  test("rejects a blank name and leaves the row untouched", () => {
    const id = seedRoute("Keep Me");

    expect(() => updateRouteName(id, "")).toThrow("Route name is required.");

    expect(getRoutes()).toEqual([{ id, name: "Keep Me" }]);
    expect(getOutbox()).toEqual([]);
  });
});

describe("deleteRoute (integration: SQLite + outbox)", () => {
  test("cascades to provinces and stores, then enqueues a delete outbox row", () => {
    const routeId = seedRoute("Doomed Route");
    const provinceId = seedProvince(routeId, "Bulacan");
    StoresDao.insertStore({ provinceId, name: "Aling Nena" });

    deleteRoute(routeId);

    expect(getRoutes()).toEqual([]);
    expect(ProvincesDao.getProvincesForRoute(routeId)).toEqual([]);
    expect(StoresDao.getStoresForProvince(provinceId)).toEqual([]);
    expect(latestOutboxFor(routeId)).toEqual({
      entity_type: "route",
      operation: "delete",
      payload: { id: routeId },
    });
  });

  test("leaves an unrelated route and its data intact", () => {
    const doomed = seedRoute("Doomed");
    const survivor = seedRoute("Survivor");
    const survivorProvince = seedProvince(survivor, "Pampanga");

    deleteRoute(doomed);

    expect(getRoutes()).toEqual([{ id: survivor, name: "Survivor" }]);
    expect(ProvincesDao.getProvincesForRoute(survivor)).toEqual([
      { id: survivorProvince, name: "Pampanga", route_id: survivor },
    ]);
  });
});
