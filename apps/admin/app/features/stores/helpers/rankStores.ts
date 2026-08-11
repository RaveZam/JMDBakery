import type { RankedStore, StoreCreditByStore } from "../types/store-types";

// Stamp the rank before any filtering happens, so a store keeps its real
// standing in the search results instead of being renumbered from 1.
export function rankStores(stores: StoreCreditByStore[]): RankedStore[] {
  return stores.map((store, index) => ({ ...store, rank: index + 1 }));
}
