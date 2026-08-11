import type { RankedStore } from "../types/store-types";

// Address parts are searchable too — "Isabela" should pull up every account in
// the province, not just a store that happens to be named after it.
function searchableText(store: RankedStore): string {
  return [store.storeName, store.barangay, store.city, store.province]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterStores(
  stores: RankedStore[],
  search: string,
): RankedStore[] {
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return stores;

  return stores.filter((store) => {
    const text = searchableText(store);
    return terms.every((term) => text.includes(term));
  });
}
