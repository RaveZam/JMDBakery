import type { RankedStore, StoreSortKey } from "../types/store-types";

const COMPARERS: Record<StoreSortKey, (a: RankedStore, b: RankedStore) => number> = {
  "revenue-high": (a, b) => b.totalRevenue - a.totalRevenue,
  "revenue-low": (a, b) => a.totalRevenue - b.totalRevenue,
  "name-asc": (a, b) => a.storeName.localeCompare(b.storeName),
  "name-desc": (a, b) => b.storeName.localeCompare(a.storeName),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
};

/** Returns a re-ordered copy; rank stays on each store, so it never renumbers. */
export function sortStores(
  stores: RankedStore[],
  sortKey: StoreSortKey,
): RankedStore[] {
  return [...stores].sort(COMPARERS[sortKey]);
}
