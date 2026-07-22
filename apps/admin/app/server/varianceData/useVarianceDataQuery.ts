import { useQuery } from "@tanstack/react-query";
import { getVarianceDataset } from "@/app/server/varianceData/getVarianceDataset";

export const VARIANCE_DATASET_QUERY_KEY = ["variance-dataset"] as const;

export function useVarianceDataQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: VARIANCE_DATASET_QUERY_KEY,
    queryFn: getVarianceDataset,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
