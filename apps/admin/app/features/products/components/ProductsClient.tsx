"use client";

import type { ReactElement } from "react";

import type { Product } from "../types/product-types";
import { useProductsState } from "../hooks/useProductsState";
import { ProductsHeader } from "./ProductsHeader";
import { ProductsTable } from "./ProductsTable";
import { ProductsModals } from "./ProductsModals";

type ProductsClientProps = {
  products: Product[];
};

export function ProductsClient({
  products: initialProducts,
}: ProductsClientProps): ReactElement {
  const state = useProductsState(initialProducts);

  return (
    <>
      <ProductsHeader
        productCount={state.products.length}
        onAddClick={() => state.setAddOpen(true)}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          <ProductsTable
            products={state.products}
            onEdit={state.setEditing}
            onDelete={state.setDeleting}
          />
        </div>
      </div>

      <ProductsModals state={state} />
    </>
  );
}
