import type { ReactElement } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProductsHeaderProps = {
  productCount: number;
  onAddClick: () => void;
};

export function ProductsHeader({
  productCount,
  onAddClick,
}: ProductsHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {productCount} product{productCount === 1 ? "" : "s"}
          </p>
        </div>

        <Button type="button" className="rounded-2xl" onClick={onAddClick}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>
    </header>
  );
}
