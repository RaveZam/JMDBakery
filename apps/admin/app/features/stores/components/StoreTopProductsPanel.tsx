import type { ReactElement } from "react";
import { Trophy } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { useStoreTopProducts } from "../hooks/useStoreTopProducts";

function TopProductsList({
  products,
}: {
  products: { productName: string; revenue: number }[];
}): ReactElement {
  const maxRevenue = products[0]?.revenue ?? 1;

  return (
    <ol className="space-y-2.5">
      {products.map((item, i) => (
        <li key={item.productName}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="truncate text-xs font-medium">
              <span className="mr-1 tabular-nums text-muted-foreground">{i + 1}.</span>
              {item.productName}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatCurrencyPHP(item.revenue)}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted">
            <div
              className="h-1 rounded-full bg-primary"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StoreTopProductsPanel({ storeId }: { storeId: string }): ReactElement {
  const { products, loading, error } = useStoreTopProducts(storeId);

  return (
    <div className="w-56 shrink-0 px-4 py-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-amber-500" />
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Top Products
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-xs text-muted-foreground">No sales recorded.</p>
      ) : (
        <TopProductsList products={products} />
      )}
    </div>
  );
}
