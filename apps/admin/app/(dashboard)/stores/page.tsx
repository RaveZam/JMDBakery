import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { ReactElement } from "react";

import { StoresPage } from "@/app/features/stores";
import { getQueryClient } from "@/lib/getQueryClient";
import { getStoresWithRevenue } from "@/app/features/stores/services/storesService";
import { STORES_QUERY_KEY } from "@/app/features/stores/storesQuery";

export default async function Page(): Promise<ReactElement> {
  const queryClient = getQueryClient();
  // Must be awaited: getStoresWithRevenue() reads cookies() via Supabase's
  // server client, which needs the request scope still open. Firing this
  // without awaiting lets it resolve after the scope closes, which crashes
  // prerendering. On back-navigation the client's 5-min staleTime still
  // serves the cached data instantly with no refetch.
  await queryClient.prefetchQuery({
    queryKey: STORES_QUERY_KEY,
    queryFn: getStoresWithRevenue,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoresPage />
    </HydrationBoundary>
  );
}
