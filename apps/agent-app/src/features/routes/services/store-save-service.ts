import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import StoresDao from "@/src/lib/dao/store-dao";
import ProvinceStoresDao from "@/src/lib/dao/province-stores-dao";
import { getCurrentUserId } from "@/src/lib/current-user";
import { getPhTime } from "@/src/shared/helpers/getPhTime";
import type { ExistingStore } from "./store-search-service";

export type StoreFields = {
  name: string;
  province: string;
  city: string;
  barangay: string;
  contactName: string;
  contactPhone: string;
};

export function createStore(provinceId: string, fields: StoreFields): string {
  const name = fields.name.trim();
  if (!name) {
    throw new Error("Store name is required.");
  }
  // A store with no creator is one nobody can edit or delete — including the
  // agent who just registered it — so refuse to write it rather than leave
  // them a row with the Edit button missing.
  const createdBy = getCurrentUserId();
  if (!createdBy) {
    throw new Error(
      `Cannot create store "${name}" in province ${provinceId}: no signed-in agent.`,
    );
  }
  let id = "";
  getDb().withTransactionSync(() => {
    // created_by is stamped locally so the store reads as this agent's while
    // still offline. It stays out of the payload below: Supabase sets it from
    // auth.uid() on push, and attribution that decides what another agent may
    // delete should not be client-supplied.
    id = StoresDao.insertStore({
      provinceId,
      name,
      province: fields.province,
      city: fields.city,
      barangay: fields.barangay,
      contactName: fields.contactName,
      contactPhone: fields.contactPhone,
      createdBy,
    });
    enqueueOutbox({
      entityType: "store",
      entityId: id,
      operation: "create",
      payload: {
        id,
        province_id: provinceId,
        store_name: name,
        province: fields.province,
        city: fields.city,
        barangay: fields.barangay,
        contact_number: fields.contactPhone,
        contact_name: fields.contactName,
      },
    });
    linkStoreToProvince(provinceId, id);
  });
  return id;
}

// Puts the store on one of this agent's provinces without touching
// stores.province_id, so a store registered by someone else keeps pointing at
// the province that registered it and can sit on both routes at once.
function linkStoreToProvince(provinceId: string, storeId: string): void {
  // One clock read for both destinations — a second one in SQLite or in
  // Postgres would drift the local row away from the synced one.
  const createdAt = getPhTime().toISOString();
  const linkId = ProvinceStoresDao.insertLink(provinceId, storeId, createdAt);
  enqueueOutbox({
    entityType: "province_store",
    entityId: linkId,
    operation: "create",
    payload: {
      id: linkId,
      province_id: provinceId,
      store_id: storeId,
      created_at: createdAt,
    },
  });
}

/**
 * Adds an already-registered store to a store table and then we simply link from local province id with the new store-id from supabase originally .
 * Writes the store row first: it was found by an online search and this device
 */
export function addExistingStore(
  provinceId: string,
  store: ExistingStore,
): void {
  getDb().withTransactionSync(() => {
    StoresDao.upsertStore({
      id: store.id,
      provinceId: store.provinceId,
      name: store.name,
      province: store.province,
      city: store.city,
      barangay: store.barangay,
      contactName: store.contactName,
      contactPhone: store.contactPhone,
      createdBy: store.createdBy,
      createdByName: store.createdByName,
    });
    linkStoreToProvince(provinceId, store.id);
  });
}

/**
 * We simply remove the link between the store and the province. Process is triggered when we remove the added store
 * that was originally from another agent's route.
 */
export function removeStoreFromProvince(
  provinceId: string,
  storeId: string,
): void {
  const link = ProvinceStoresDao.getLink(provinceId, storeId);
  if (!link) return;
  getDb().withTransactionSync(() => {
    ProvinceStoresDao.deleteLink(provinceId, storeId);
    enqueueOutbox({
      entityType: "province_store",
      entityId: link.id,
      operation: "delete",
      payload: { id: link.id },
    });
  });
}

export function updateStore(
  id: string,
  provinceId: string,
  fields: StoreFields,
): void {
  const name = fields.name.trim();
  if (!name) {
    throw new Error("Store name is required.");
  }
  getDb().withTransactionSync(() => {
    StoresDao.updateStore(id, { ...fields, name });
    enqueueOutbox({
      entityType: "store",
      entityId: id,
      operation: "update",
      payload: {
        id,
        province_id: provinceId,
        store_name: name,
        province: fields.province,
        city: fields.city,
        barangay: fields.barangay,
        contact_number: fields.contactPhone,
        contact_name: fields.contactName,
      },
    });
  });
}

export function deleteStore(id: string): void {
  getDb().withTransactionSync(() => {
    StoresDao.deleteStore(id);
    enqueueOutbox({
      entityType: "store",
      entityId: id,
      operation: "delete",
      payload: { id },
    });
  });
}
