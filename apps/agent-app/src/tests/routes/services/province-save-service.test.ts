// Integration: real SQLite (node:sqlite) + real outbox. See route-save-service
// test for the pattern. Supabase push (runOutboxSync) is out of scope.
import {
  createProvince,
  updateProvinceName,
  deleteProvince,
  getProvinces,
} from "../province-save-service";
import StoresDao from "@/src/lib/dao/store-dao";
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

describe("createProvince (integration: SQLite + outbox)", () => {
  test("inserts the province under its route and enqueues a create outbox row", () => {
    const routeId = seedRoute();

    const id = createProvince(routeId, "Bulacan");

    expect(getProvinces(routeId)).toEqual([
      { id, name: "Bulacan", route_id: routeId },
    ]);
    expect(latestOutboxFor(id)).toEqual({
      entity_type: "province",
      operation: "create",
      payload: { id, name: "Bulacan", route_id: routeId },
    });
  });

  test("trims whitespace before persisting and enqueueing", () => {
    const routeId = seedRoute();

    const id = createProvince(routeId, "  Pampanga  ");

    expect(getProvinces(routeId)).toEqual([
      { id, name: "Pampanga", route_id: routeId },
    ]);
    expect(latestOutboxFor(id)?.payload).toEqual({
      id,
      name: "Pampanga",
      route_id: routeId,
    });
  });

  test("rejects a blank name and writes nothing", () => {
    const routeId = seedRoute();

    expect(() => createProvince(routeId, "   ")).toThrow(
      "Province name is required.",
    );

    expect(getProvinces(routeId)).toEqual([]);
    expect(getOutbox()).toEqual([]);
  });
});

describe("updateProvinceName (integration: SQLite + outbox)", () => {
  test("renames the province and enqueues an update outbox row", () => {
    const routeId = seedRoute();
    const id = seedProvince(routeId, "Old Province");

    updateProvinceName(id, "  Renamed  ");

    expect(getProvinces(routeId)).toEqual([
      { id, name: "Renamed", route_id: routeId },
    ]);
    expect(latestOutboxFor(id)).toEqual({
      entity_type: "province",
      operation: "update",
      payload: { name: "Renamed" },
    });
  });

  test("rejects a blank name and leaves the row untouched", () => {
    const routeId = seedRoute();
    const id = seedProvince(routeId, "Keep Me");

    expect(() => updateProvinceName(id, "  ")).toThrow(
      "Province name is required.",
    );

    expect(getProvinces(routeId)).toEqual([
      { id, name: "Keep Me", route_id: routeId },
    ]);
    expect(getOutbox()).toEqual([]);
  });
});

describe("deleteProvince (integration: SQLite + outbox)", () => {
  test("deletes the province and its stores, then enqueues a delete outbox row", () => {
    const routeId = seedRoute();
    const provinceId = seedProvince(routeId, "Bulacan");
    StoresDao.insertStore({ provinceId, name: "Aling Nena" });

    deleteProvince(provinceId);

    expect(getProvinces(routeId)).toEqual([]);
    expect(StoresDao.getStoresForProvince(provinceId)).toEqual([]);
    expect(latestOutboxFor(provinceId)).toEqual({
      entity_type: "province",
      operation: "delete",
      payload: { id: provinceId },
    });
  });

  test("only removes the targeted province under the route", () => {
    const routeId = seedRoute();
    const doomed = seedProvince(routeId, "Doomed");
    const survivor = seedProvince(routeId, "Survivor");

    deleteProvince(doomed);

    expect(getProvinces(routeId)).toEqual([
      { id: survivor, name: "Survivor", route_id: routeId },
    ]);
  });
});
