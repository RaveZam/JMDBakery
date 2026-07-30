// A store picked up from another agent keeps that agent's stores.province_id,
// which this device has no provinces row for. Session stops must therefore take
// their province from session_stores.province_id — the province the stop was
// filed under — or every such stop renders as "Unknown".
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import StoresDao from "@/src/lib/dao/store-dao";
import { insertSessionStore } from "@/src/features/sessions/services/session-store-save-service";
import { getDb } from "@/src/lib/db";
import {
  createSchema,
  resetDb,
  seedAdoptedStore,
  seedProvince,
  seedRoute,
  seedRouteSession,
  seedStore,
} from "@/src/test-utils/db-test-helpers";

let routeId: string;
let provinceId: string;
let sessionId: string;

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  routeId = seedRoute();
  provinceId = seedProvince(routeId, "Santiago City");
  sessionId = seedRouteSession();
});

/** Mirrors sessionLocalService: stops are built from getStoresForRoute. */
function startSession(): void {
  getDb().withTransactionSync(() => {
    for (const store of StoresDao.getStoresForRoute(routeId)) {
      insertSessionStore({
        sessionId,
        store,
        createdAt: "2026-07-29T00:00:00.000Z",
      });
    }
  });
}

test("an adopted store's stop is filed under the adopting province", () => {
  seedAdoptedStore(provinceId, "Mrs G santiago");

  startSession();

  expect(SessionStoresDao.getBySessionId(sessionId)).toMatchObject([
    { store_name: "Mrs G santiago", province_name: "Santiago City" },
  ]);
});

test("an own store still reports its own province", () => {
  seedStore(provinceId, "Aling Nena");

  startSession();

  expect(SessionStoresDao.getBySessionId(sessionId)).toMatchObject([
    { store_name: "Aling Nena", province_name: "Santiago City" },
  ]);
});

test("a store on two provinces of the route becomes one stop", () => {
  const storeId = seedStore(provinceId, "Aling Nena");
  const otherProvinceId = seedProvince(routeId, "Ilagan");
  getDb().runSync(
    `INSERT INTO province_stores (id, province_id, store_id, created_at) VALUES (?, ?, ?, ?)`,
    ["link-2", otherProvinceId, storeId, "2026-07-29T00:00:00.000Z"],
  );

  startSession();

  expect(SessionStoresDao.getBySessionId(sessionId)).toHaveLength(1);
});
