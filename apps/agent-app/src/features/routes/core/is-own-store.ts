import type { StoreRow } from "../types/db-rows";

/**
 * Whether the signed-in agent registered this store — which decides whether it
 * is theirs to edit and delete, or only to drop off their own route.
 *
 * A store with no attribution reads as *not* own on purpose. Being wrong that
 * way downgrades Delete to Remove, which only cuts this agent's link and can be
 * undone by adding the store back. Being wrong the other way hands every agent
 * the power to destroy a colleague's store for everyone. Rows written before
 * `created_by` existed pick their attribution up on the next download.
 */
export function isOwnStore(
  store: Pick<StoreRow, "created_by">,
  currentUserId: string | null,
): boolean {
  if (!store.created_by || !currentUserId) return false;
  return store.created_by === currentUserId;
}
