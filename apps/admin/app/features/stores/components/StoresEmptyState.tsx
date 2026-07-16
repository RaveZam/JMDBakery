import type { ReactElement } from "react";
import { Store } from "lucide-react";

export function StoresEmptyState(): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
      <Store className="h-10 w-10 opacity-50" />
      <p className="text-sm">No stores found.</p>
      <p className="text-xs">
        Stores will appear once agents sync their route data.
      </p>
    </div>
  );
}
