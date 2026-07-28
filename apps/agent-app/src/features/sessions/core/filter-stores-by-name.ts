import type { SessionStore } from "../types/session-types";

export function filterStoresByName(
  stores: SessionStore[],
  query: string,
): SessionStore[] {
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery === "") return stores;

  return stores.filter((store) =>
    store.store_name.toLowerCase().includes(trimmedQuery),
  );
}
