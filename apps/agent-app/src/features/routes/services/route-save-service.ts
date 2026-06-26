import { getDb } from "@/src/lib/db";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import RoutesDao from "@/src/lib/dao/routes-dao";

export function getRoutes() {
  return RoutesDao.getAllRoutes();
}

export function createRoute(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Route name is required.");
  }
  let id = "";
  getDb().withTransactionSync(() => {
    id = RoutesDao.insertRoute(trimmed);
    enqueueOutbox({
      entityType: "route",
      entityId: id,
      operation: "create",
      payload: { id, name: trimmed },
    });
  });
  return id;
}

export function updateRouteName(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Route name is required.");
  }
  getDb().withTransactionSync(() => {
    RoutesDao.renameRoute(id, trimmed);
    enqueueOutbox({
      entityType: "route",
      entityId: id,
      operation: "update",
      payload: { name: trimmed },
    });
  });
}

export function deleteRoute(id: string) {
  getDb().withTransactionSync(() => {
    RoutesDao.deleteRoute(id);
    enqueueOutbox({
      entityType: "route",
      entityId: id,
      operation: "delete",
      payload: { id },
    });
  });
}
