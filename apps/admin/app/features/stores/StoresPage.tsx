import type { ReactElement } from "react";

import { getStoresWithRevenue } from "./services/storesService";
import { StoresGrid } from "./components/StoresGrid";
import { StoresEmptyState } from "./components/StoresEmptyState";

export async function StoresPage(): Promise<ReactElement> {
  const stores = await getStoresWithRevenue();

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Stores</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Store directory with sales performance.
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          {stores.length === 0 ? (
            <StoresEmptyState />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {stores.length}
                </span>{" "}
                stores
              </p>
              <StoresGrid stores={stores} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default StoresPage;
