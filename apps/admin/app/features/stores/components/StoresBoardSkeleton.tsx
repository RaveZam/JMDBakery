import type { ReactElement } from "react";

export function StoresBoardSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border bg-background px-2 shadow-sm">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border/60 px-2 py-3.5 last:border-b-0"
        >
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            <div className="h-1 w-full animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
