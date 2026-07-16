import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { ReactElement } from "react";

import { StoresPage } from "@/app/features/stores";
import { getQueryClient } from "@/lib/getQueryClient";
import { getStoresWithRevenue } from "@/app/features/stores/services/storesService";
import { STORES_QUERY_KEY } from "@/app/features/stores/storesQuery";

export default async function Page(): Promise<ReactElement> {
  const queryClient = getQueryClient();
  // Kick off the fetch but don't block the server render on it. getQueryClient's
  // dehydrate config streams the still-pending query to the client, which resolves
  // it via Suspense on first load. On back-navigation the client's 5-min staleTime
  // serves the cached data instantly with no refetch.
  void queryClient.prefetchQuery({
    queryKey: STORES_QUERY_KEY,
    queryFn: getStoresWithRevenue,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoresPage />
    </HydrationBoundary>
  );
}
