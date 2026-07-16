import { useQuery } from "@tanstack/react-query";
import { getStoresWithRevenue } from "./services/storesService";
import type { StoreRow } from "./types/store-types";

export const STORES_QUERY_KEY = ["stores-with-revenue"] as const;

export function useStoresQuery() {
  const { data, isLoading, error } = useQuery<StoreRow[]>({
    queryKey: STORES_QUERY_KEY,
    queryFn: getStoresWithRevenue,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
