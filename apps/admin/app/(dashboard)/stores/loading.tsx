import type { ReactElement } from "react";

import { StoresBoardSkeleton } from "@/app/features/stores/components/StoresBoardSkeleton";

export default function Loading(): ReactElement {
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="text-3xl font-semibold tracking-tight">Stores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Store directory with sales performance.
          </p>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <StoresBoardSkeleton />
        </div>
      </div>
    </>
  );
}
