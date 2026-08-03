import type { StoreRow } from "../types/db-rows";

/**
 * This Checks if the store belongs to the current user
 *
 *  @params store - The store to check
 *  @params currentUserId - The current user id
 *  @returns true if the store belongs to the current user, false otherwise
 */
export function isOwnStore(
  store: Pick<StoreRow, "created_by">,
  currentUserId: string | null,
): boolean {
  if (!store.created_by || !currentUserId) return false;
  return store.created_by === currentUserId;
}
