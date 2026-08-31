import { useQuery } from "@tanstack/react-query";
import { getStoreCreditTotals } from "./services/getStoreCreditTotals";
import type { StoreCredit } from "./types/store-types";

export const STORE_CREDIT_TOTALS_QUERY_KEY = ["store-credit-totals"] as const;

export function useStoreCreditTotalsQuery() {
  const { data, isLoading, error } = useQuery<StoreCredit[]>({
    queryKey: STORE_CREDIT_TOTALS_QUERY_KEY,
    queryFn: getStoreCreditTotals,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
