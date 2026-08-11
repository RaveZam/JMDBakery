import { useQuery } from "@tanstack/react-query";
import { getCreditPayments } from "@/app/server/creditPayments/getCreditPayments";

export const CREDIT_PAYMENTS_QUERY_KEY = ["credit-payments"] as const;

export function useCreditPaymentsQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: CREDIT_PAYMENTS_QUERY_KEY,
    queryFn: getCreditPayments,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
