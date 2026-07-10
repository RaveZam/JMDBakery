// Integration: real SQLite (node:sqlite) + real outbox. Also covers the
// read getters in store-services.ts, since they read back what the save
// service writes. Supabase push (runOutboxSync) is out of scope.
import {
  createStore,
  updateStore,
  deleteStore,
  type StoreFields,
} from "../store-save-service";
import { getStoreById, getStoresForProvince } from "../store-services";
import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  getOutbox,
  latestOutboxFor,
} from "@/src/test-utils/db-test-helpers";

// Factory so each test names only the fields it cares about.
function makeFields(overrides: Partial<StoreFields> = {}): StoreFields {
  return {
    name: "Aling Nena Store",
    province: "Bulacan",
    city: "Malolos",
    barangay: "Bulihan",
    contactName: "Nena",
    contactPhone: "09171234567",
    ...overrides,
  };
}

let provinceId: string;

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
  provinceId = seedProvince(seedRoute());
});

describe("createStore (integration: SQLite + outbox)", () => {
  test("persists every field and enqueues a remote-shaped create outbox row", () => {
    const id = createStore(provinceId, makeFields());

    // Local row keeps app-shaped column names (name, contact_number).
    expect(getStoreById(id)).toMatchObject({
      id,
      province_id: provinceId,
      name: "Aling Nena Store",
      province: "Bulacan",
      city: "Malolos",
      barangay: "Bulihan",
      contact_number: "09171234567",
      contact_name: "Nena",
    });

    // Outbox payload is remote-shaped: store_name (not name) and contactPhone
    // mapped onto contact_number.
    expect(latestOutboxFor(id)).toEqual({
      entity_type: "store",
      operation: "create",
      payload: {
        id,
        province_id: provinceId,
        store_name: "Aling Nena Store",
        province: "Bulacan",
        city: "Malolos",
        barangay: "Bulihan",
        contact_number: "09171234567",
        contact_name: "Nena",
      },
    });
  });

  test("trims the store name before persisting and enqueueing", () => {
    const id = createStore(provinceId, makeFields({ name: "  Trimmed  " }));

    expect(getStoreById(id)?.name).toBe("Trimmed");
    expect(latestOutboxFor(id)?.payload).toMatchObject({
      store_name: "Trimmed",
    });
  });

  test("rejects a blank name and writes nothing to either table", () => {
    expect(() => createStore(provinceId, makeFields({ name: "  " }))).toThrow(
      "Store name is required.",
    );

    expect(getStoresForProvince(provinceId)).toEqual([]);
    expect(getOutbox()).toEqual([]);
  });
});

describe("updateStore (integration: SQLite + outbox)", () => {
  test("updates the row and enqueues a remote-shaped update outbox row", () => {
    const id = createStore(provinceId, makeFields());

    updateStore(
      id,
      provinceId,
      makeFields({ name: "Renamed Store", city: "Meycauayan" }),
    );

    expect(getStoreById(id)).toMatchObject({
      id,
      name: "Renamed Store",
      city: "Meycauayan",
    });
    expect(latestOutboxFor(id)).toMatchObject({
      entity_type: "store",
      operation: "update",
      payload: { id, store_name: "Renamed Store", city: "Meycauayan" },
    });
  });

  test("rejects a blank name and leaves the row untouched", () => {
    const id = createStore(provinceId, makeFields({ name: "Original" }));

    expect(() => updateStore(id, provinceId, makeFields({ name: "" }))).toThrow(
      "Store name is required.",
    );

    expect(getStoreById(id)?.name).toBe("Original");
    // Only the create row exists; no update row was enqueued.
    expect(getOutbox("store")).toHaveLength(1);
    expect(getOutbox("store")[0].operation).toBe("create");
  });
});

describe("deleteStore (integration: SQLite + outbox)", () => {
  test("removes the store and enqueues a delete outbox row", () => {
    const id = createStore(provinceId, makeFields());

    deleteStore(id);

    expect(getStoreById(id)).toBeNull();
    expect(getStoresForProvince(provinceId)).toEqual([]);
    expect(latestOutboxFor(id)).toMatchObject({
      entity_type: "store",
      operation: "delete",
      payload: { id },
    });
  });
});

describe("store reads (store-services)", () => {
  test("getStoresForProvince returns only stores in that province", () => {
    const otherProvince = seedProvince(seedRoute("Other Route"), "Pampanga");
    const inProvince = createStore(provinceId, makeFields({ name: "Here" }));
    createStore(otherProvince, makeFields({ name: "Elsewhere" }));

    const rows = getStoresForProvince(provinceId);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: inProvince, name: "Here" });
  });

  test("getStoreById returns null for an unknown id", () => {
    expect(getStoreById("does-not-exist")).toBeNull();
  });
});
