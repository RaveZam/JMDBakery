import { useCallback, useEffect, useState } from "react";

import {
  searchStoresByProvince,
  type ExistingStore,
} from "../services/store-search-service";
import { addExistingStore } from "../services/store-save-service";

function messageFor(searchError: unknown): string {
  return searchError instanceof Error
    ? searchError.message
    : "Failed to search for stores.";
}

/**
 * Drives the "add existing store" list: holds the search term, runs the online
 * lookup, and adds a picked store to the province. Seeds the term with the
 * province name and searches on open, since that is the answer the agent wants
 * almost every time.
 */
export function useStoreSearch(provinceId: string, provinceName: string) {
  const [term, setTerm] = useState(provinceName);
  const [results, setResults] = useState<ExistingStore[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (searchTerm: string) => {
      setIsSearching(true);
      setError(null);
      try {
        setResults(await searchStoresByProvince(searchTerm, provinceId));
      } catch (searchError) {
        setResults([]);
        setError(messageFor(searchError));
      } finally {
        setIsSearching(false);
      }
    },
    [provinceId],
  );

  useEffect(() => {
    setTerm(provinceName);
    search(provinceName);
  }, [provinceName, search]);

  // Dropping the added store keeps the list showing only what is still addable.
  const add = useCallback(
    (store: ExistingStore) => {
      addExistingStore(provinceId, store);
      setResults((prev) => prev.filter((result) => result.id !== store.id));
    },
    [provinceId],
  );

  return {
    term,
    setTerm,
    results,
    isSearching,
    error,
    add,
    search: () => search(term),
  };
}
