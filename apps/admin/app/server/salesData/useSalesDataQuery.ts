import { useQuery } from "@tanstack/react-query";
import { getSalesDataset } from "@/app/server/salesData/getBaseData";

export const SALES_DATASET_QUERY_KEY = ["sales-dataset"] as const;

export function useSalesDataQuery(dateStart?: string, dateEnd?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...SALES_DATASET_QUERY_KEY, dateStart ?? null, dateEnd ?? null],
    queryFn: () => getSalesDataset(dateStart, dateEnd),
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
