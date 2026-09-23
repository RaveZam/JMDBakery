import { getDb } from "@/src/lib/db";
import RoutesDao from "@/src/lib/dao/routes-dao";
import { enqueueOutbox } from "@/src/lib/sync/outbox";
import { supabase } from "@/src/lib/supabase";
import type { InventoryVerificationStatus } from "../types/inventory-types";

export function requestVerification(
  routeId: string,
  status: InventoryVerificationStatus,
): void {
  getDb().withTransactionSync(() => {
    RoutesDao.updateVerifyPending(routeId, status);
    enqueueOutbox({
      entityType: "route_session",
      entityId: routeId,
      operation: "update",
      payload: { inventory_verified: status },
    });
  });
}

export function cancelVerification(routeId: string): void {
  getDb().withTransactionSync(() => {
    RoutesDao.updateVerifyPending(routeId, "cancelled");
    enqueueOutbox({
      entityType: "route_session",
      entityId: routeId,
      operation: "update",
      payload: { inventory_verified: "cancelled" },
    });
  });
}

// One-shot fetch of the remote verification status. Polling/interval
// ownership belongs in the hook, not here.
export async function fetchVerificationStatus(
  routeId: string,
): Promise<InventoryVerificationStatus> {
  const { data: route_sessions, error } = await supabase
    .from("route_sessions")
    .select("inventory_verified")
    .eq("id", routeId)
    .maybeSingle();

  if (error) throw error;
  // The session may not have synced to the server yet - nothing to check.
  if (!route_sessions) return "";

  const status: InventoryVerificationStatus =
    route_sessions.inventory_verified ?? "";
  if (status === "verified") {
    RoutesDao.updateVerifyPending(routeId, "verified");
  }
  return status;
}

// Owns the poll interval and its own stop condition (verified/cancelled), so
// the hook just hands over a callback instead of managing a timer itself.
// Returns a cleanup function for the caller's effect.
export function pollVerificationStatus(
  routeId: string,
  onUpdate: (status: InventoryVerificationStatus) => void,
): () => void {
  const id = setInterval(() => {
    fetchVerificationStatus(routeId)
      .then((status) => {
        onUpdate(status);
        if (status === "verified" || status === "cancelled") {
          clearInterval(id);
        }
      })
      .catch((error) => console.warn("verification poll failed", error));
  }, 3000);
  return () => clearInterval(id);
}
