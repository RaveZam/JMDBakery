import type { ReactElement } from "react";

export function ProductsTableSkeleton(): ReactElement {
  return (
    <div className="space-y-3">
      <div className="h-9 w-48 animate-pulse rounded-2xl bg-muted" />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 text-xs text-muted-foreground dark:bg-background/80">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
                    <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
