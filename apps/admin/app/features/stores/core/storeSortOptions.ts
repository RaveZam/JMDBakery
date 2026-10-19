import type { StoreSortKey } from "../types/store-types";

export const STORE_SORT_OPTIONS: { key: StoreSortKey; label: string }[] = [
  { key: "revenue-high", label: "Revenue: highest to lowest" },
  { key: "revenue-low", label: "Revenue: lowest to highest" },
  { key: "name-asc", label: "Name: A to Z" },
  { key: "name-desc", label: "Name: Z to A" },
  { key: "newest", label: "Newest to oldest" },
  { key: "oldest", label: "Oldest to newest" },
];
