// Integration: real SQLite (node:sqlite) + real outbox. Covers the province_stores
// junction — a store can sit on more than one province, so "remove from my route"
// and "delete the store" are different operations.
import {
  addExistingStore,
  createStore,
  deleteStore,
  removeStoreFromProvince,
} from "@/src/features/routes/services/store-save-service";
import {
  getStoreById,
  getStoresForProvince,
} from "@/src/features/routes/services/store-services";
import StoresDao from "@/src/lib/dao/store-dao";
import ProvinceStoresDao from "@/src/lib/dao/province-stores-dao";
import { getDb } from "@/src/lib/db";
import { setCurrentUserId } from "@/src/lib/current-user";
import type { ExistingStore } from "@/src/features/routes/services/store-search-service";
import {
  createSchema,
  resetDb,
  seedAdoptedStore,
  seedProvince,
  seedRoute,
  seedStore,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";

/** The shape the search modal hands to addExistingStore. */
function found(id: string, overrides: Partial<ExistingStore> = {}): ExistingStore {
  return {
    id,
    name: "Colleague Store",
    provinceId: "foreign-province",
    province: "Isabela",
    city: "Echague",
    barangay: "",
    contactName: "",
    contactPhone: "",
    createdBy: "user-2",
    createdByName: "Agent A",
    ...overrides,
  };
}

let routeId: string;
let provinceId: string;

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  routeId = seedRoute();
  provinceId = seedProvince(routeId);
});

describe("createStore", () => {
  test("links the new store to its province so it is readable", () => {
    const id = createStore(provinceId, {
      name: "Aling Nena",
      province: "Isabela",
      city: "Echague",
      barangay: "",
      contactName: "",
      contactPhone: "",
    });

    expect(getStoresForProvince(provinceId).map((s) => s.id)).toEqual([id]);
    expect(ProvinceStoresDao.countLinksForStore(id)).toBe(1);
  });

  test("enqueues the link alongside the store", () => {
    const id = createStore(provinceId, {
      name: "Aling Nena",
      province: "",
      city: "",
      barangay: "",
      contactName: "",
      contactPhone: "",
    });

    const links = getOutbox("province_store");
    expect(links).toHaveLength(1);
    expect(JSON.parse(links[0].payload)).toMatchObject({
      province_id: provinceId,
      store_id: id,
    });
  });

  // A store with no creator is one nobody can edit or delete, including the
  // agent who just registered it. Better to fail than to write that row.
  test("refuses to write a store when no agent is signed in", () => {
    setCurrentUserId(null);

    expect(() =>
      createStore(provinceId, {
        name: "Aling Nena",
        province: "",
        city: "",
        barangay: "",
        contactName: "",
        contactPhone: "",
      }),
    ).toThrow(/no signed-in agent/);

    expect(getStoresForProvince(provinceId)).toEqual([]);
    expect(getOutbox()).toEqual([]);
  });

  // Two clock reads for one event drift, so the pushed row must carry the same
  // created_at the local row got — not one Postgres stamps on arrival.
  test("the link's created_at is the same value locally and in the payload", () => {
    const id = createStore(provinceId, {
      name: "Aling Nena",
      province: "",
      city: "",
      barangay: "",
      contactName: "",
      contactPhone: "",
    });

    const local = ProvinceStoresDao.getLink(provinceId, id);
    const payload = JSON.parse(getOutbox("province_store")[0].payload);
    expect(payload.created_at).toBe(local?.created_at);
    expect(local?.created_at).toEqual(expect.any(String));
  });
});

describe("addExistingStore", () => {
  test("puts another agent's store on this province without touching the store", () => {
    const foreignStoreId = seedAdoptedStore(
      seedProvince(routeId, "Elsewhere"),
      "Colleague Store",
    );
    // Start from a clean slate: seeding already linked it to the other province.
    const targetProvinceId = provinceId;

    addExistingStore(targetProvinceId, found(foreignStoreId));

    expect(getStoresForProvince(targetProvinceId).map((s) => s.id)).toEqual([
      foreignStoreId,
    ]);
    // The store row itself still points at whoever registered it.
    expect(StoresDao.getStoreById(foreignStoreId)?.province_id).toBe(
      "foreign-province",
    );
  });

  test("writes a store this device has never pulled", () => {
    // The search hits Supabase directly, so a picked store is routinely absent
    // from the local table — linking alone would fail province_stores' FK.
    addExistingStore(provinceId, found("never-downloaded"));

    expect(getStoresForProvince(provinceId).map((s) => s.id)).toEqual([
      "never-downloaded",
    ]);
    expect(StoresDao.getStoreById("never-downloaded")).toMatchObject({
      name: "Colleague Store",
      created_by: "user-2",
      created_by_name: "Agent A",
    });
  });

});

describe("pushing an adopted store", () => {
  test("enqueues only the link, never the store", () => {
    addExistingStore(provinceId, found("never-downloaded"));

    expect(getOutbox("store")).toEqual([]);
    expect(getOutbox("province_store")).toHaveLength(1);
  });

});

describe("adding the same store twice", () => {
  test("leaves one link on the province", () => {
    const storeId = seedStore(seedProvince(routeId, "Elsewhere"));

    addExistingStore(provinceId, found(storeId));
    addExistingStore(provinceId, found(storeId));

    expect(getStoresForProvince(provinceId)).toHaveLength(1);
    expect(ProvinceStoresDao.countLinksForStore(storeId)).toBe(2); // seeded + this one
  });
});

describe("a store on two provinces of one route", () => {
  test("is a single session stop", () => {
    const otherProvinceId = seedProvince(routeId, "Second");
    const storeId = seedStore(provinceId);
    addExistingStore(otherProvinceId, found(storeId, { provinceId }));

    expect(StoresDao.getStoresForRoute(routeId)).toHaveLength(1);
  });
});

describe("removeStoreFromProvince", () => {
  test("drops the link but keeps the store and its other links", () => {
    const otherProvinceId = seedProvince(routeId, "Second");
    const storeId = seedStore(provinceId);
    addExistingStore(otherProvinceId, found(storeId, { provinceId }));

    removeStoreFromProvince(provinceId, storeId);

    expect(getStoresForProvince(provinceId)).toEqual([]);
    expect(getStoresForProvince(otherProvinceId).map((s) => s.id)).toEqual([
      storeId,
    ]);
    expect(StoresDao.getStoreById(storeId)).not.toBeNull();
  });

  test("enqueues a link delete, never a store delete", () => {
    const storeId = seedStore(provinceId);
    const linkId = ProvinceStoresDao.getLink(provinceId, storeId)!.id;

    removeStoreFromProvince(provinceId, storeId);

    expect(latestOutboxFor(linkId)).toMatchObject({
      entity_type: "province_store",
      operation: "delete",
    });
    expect(getOutbox("store")).toEqual([]);
  });

  test("removing a store that is not on the province does nothing", () => {
    const storeId = seedStore(seedProvince(routeId, "Elsewhere"));

    removeStoreFromProvince(provinceId, storeId);

    expect(getOutbox("province_store")).toEqual([]);
  });
});

describe("deleteStore", () => {
  test("takes its links with it", () => {
    const otherProvinceId = seedProvince(routeId, "Second");
    const storeId = seedStore(provinceId);
    addExistingStore(otherProvinceId, found(storeId, { provinceId }));

    deleteStore(storeId);

    expect(ProvinceStoresDao.countLinksForStore(storeId)).toBe(0);
    expect(getStoresForProvince(otherProvinceId)).toEqual([]);
  });
});

// The rule itself is tested in tests/routes/core/is-own-store.test.ts. What
// matters here is that the service actually attaches it to what screens read.
describe("isOwn", () => {
  afterEach(() => setCurrentUserId(null));

  test("is attached to stores the service hands back", () => {
    setCurrentUserId("user-1");
    seedStore(provinceId, "Mine", "user-1");
    seedAdoptedStore(provinceId);

    const byName = Object.fromEntries(
      getStoresForProvince(provinceId).map((store) => [store.name, store.isOwn]),
    );

    expect(byName).toEqual({ Mine: true, "Colleague Store": false });
  });

  // Reading created_by instead of looking the province up: losing the province
  // must not turn the owner's Delete into a Remove.
  test("survives the province the store was registered under being deleted", () => {
    setCurrentUserId("user-1");
    const otherProvinceId = seedProvince(routeId, "Second");
    const storeId = seedStore(otherProvinceId, "Store A", "user-1");
    ProvinceStoresDao.insertLink(provinceId, storeId, "2026-06-30T00:00:00Z");

    getDb().runSync(`DELETE FROM provinces WHERE id = ?`, [otherProvinceId]);

    expect(getStoreById(storeId)?.isOwn).toBe(true);
  });
});

describe("deleting a route", () => {
  test("removes stores registered under it but only unlinks adopted ones", () => {
    const ownStoreId = seedStore(provinceId);
    const adoptedStoreId = seedAdoptedStore(provinceId);

    getDb().withTransactionSync(() => {
      getDb().runSync(
        `DELETE FROM stores WHERE province_id IN (SELECT id FROM provinces WHERE route_id = ?)`,
        [routeId],
      );
      getDb().runSync(`DELETE FROM provinces WHERE route_id = ?`, [routeId]);
      getDb().runSync(`DELETE FROM routes WHERE id = ?`, [routeId]);
    });

    expect(StoresDao.getStoreById(ownStoreId)).toBeNull();
    // The colleague's store survives — only this agent's link to it is gone.
    expect(StoresDao.getStoreById(adoptedStoreId)).not.toBeNull();
    expect(ProvinceStoresDao.countLinksForStore(adoptedStoreId)).toBe(0);
  });
});
