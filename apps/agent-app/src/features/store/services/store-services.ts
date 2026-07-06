import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { SessionStoreDetails } from "../types/store-types";

export function getSessionStoreById(id: string): SessionStoreDetails | null {
  return SessionStoresDao.getById(id) ?? null;
}
