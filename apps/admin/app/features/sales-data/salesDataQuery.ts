import { useQuery } from "@tanstack/react-query";
import { getSalesDataset } from "@/app/server/getBaseData";

export const SALES_DATASET_QUERY_KEY = ["sales-dataset"] as const;

// async function fetchSalesDataset(): Promise<SalesRecord[]> {
//   const res = await fetch("/api/sales-dataset");
//   if (!res.ok) throw new Error("Failed to load sales dataset");
//   return res.json();
// }

export function useSalesDataQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: SALES_DATASET_QUERY_KEY,
    queryFn: getSalesDataset,
  });

  return { data: data ?? [], isLoading, error: error as Error | null };
}
