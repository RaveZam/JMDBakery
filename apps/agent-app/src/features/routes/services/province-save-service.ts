import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import ProvincesDao from "@/src/lib/dao/province-dao";
import { ProvinceRow } from "../types/db-rows";

export function getProvinces(routeId: string): ProvinceRow[] {
  return ProvincesDao.getProvincesForRoute(routeId);
}

export function createProvince(routeId: string, name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Province name is required.");
  }
  let id = "";
  getDb().withTransactionSync(() => {
    id = ProvincesDao.insertProvince(routeId, trimmed);
    enqueueOutbox({
      entityType: "province",
      entityId: id,
      operation: "create",
      payload: { id, name: trimmed, route_id: routeId },
    });
  });
  return id;
}
