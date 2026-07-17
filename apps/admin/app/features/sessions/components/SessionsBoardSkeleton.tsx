import type { ReactElement } from "react";

export function SessionsBoardSkeleton(): ReactElement {
  return (
    <div className="space-y-3">
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
