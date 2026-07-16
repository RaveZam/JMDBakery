import type { ReactElement } from "react";

import type { Product } from "../types/product-types";
import { ProductsEmptyState } from "./ProductsEmptyState";
import { ProductRow } from "./ProductRow";

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: ProductsTableProps): ReactElement {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border bg-card shadow-soft">
        <ProductsEmptyState />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50/80 backdrop-blur dark:bg-background/80">
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
