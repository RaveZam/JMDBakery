import type { ReactElement } from "react";
import { Store } from "lucide-react";

export function StoresEmptyState(): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-muted-foreground">
      <Store className="h-9 w-9 opacity-40" />
      <p className="text-sm font-medium text-foreground">No stores yet</p>
      <p className="text-xs">
        Stores will appear here once agents sync their route data.
      </p>
    </div>
  );
}
