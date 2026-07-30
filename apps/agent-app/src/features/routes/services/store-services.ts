import StoresDao from "@/src/lib/dao/store-dao";
import { getCurrentUserId } from "@/src/lib/current-user";
import { isOwnStore } from "../core/is-own-store";
import type { Store, StoreRow } from "../types/db-rows";

// A simple boolean is added when if the store is created by the current user or not (used for delete button and viewing cards)
function toStore(row: StoreRow, currentUserId: string | null): Store {
  return { ...row, isOwn: isOwnStore(row, currentUserId) };
}

export function getStoresForProvince(provinceId: string): Store[] {
  const currentUserId = getCurrentUserId();
  return StoresDao.getStoresForProvince(provinceId).map((row) =>
    toStore(row, currentUserId),
  );
}

export function getStoreById(id: string): Store | null {
  const row = StoresDao.getStoreById(id);
  return row ? toStore(row, getCurrentUserId()) : null;
}
