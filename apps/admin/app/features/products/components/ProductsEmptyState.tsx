import type { ReactElement } from "react";
import { Package } from "lucide-react";

export function ProductsEmptyState(): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
      <Package className="h-10 w-10 opacity-50" />
      <p className="text-sm">No products yet.</p>
      <p className="text-xs">Add your first product to get started.</p>
    </div>
  );
}
