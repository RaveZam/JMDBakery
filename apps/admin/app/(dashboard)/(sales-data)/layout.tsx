import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/app/features/sales-data/getQueryClient";
import { getSalesDataset } from "@/app/server/getBaseData";
import { SALES_DATASET_QUERY_KEY } from "@/app/features/sales-data/salesDataQuery";

export default async function SalesDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: SALES_DATASET_QUERY_KEY,
    queryFn: getSalesDataset,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
