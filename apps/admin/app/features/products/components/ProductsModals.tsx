import type { ReactElement } from "react";

import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import type { useProductsState } from "../hooks/useProductsState";
import { ProductFormModal } from "./ProductFormModal";

type ProductsModalsProps = {
  state: ReturnType<typeof useProductsState>;
};

export function ProductsModals({ state }: ProductsModalsProps): ReactElement {
  return (
    <>
      {state.addOpen ? (
        <ProductFormModal
          title="Add Product"
          onClose={() => state.setAddOpen(false)}
          onSubmit={state.handleAdd}
        />
      ) : null}

      {state.editing ? (
        <ProductFormModal
          title="Edit Product"
          initialValues={{ name: state.editing.name, price: state.editing.price }}
          onClose={() => state.setEditing(null)}
          onSubmit={state.handleSave}
        />
      ) : null}

      {state.deleting ? (
        <ConfirmDeleteModal
          title="Delete product"
          description={`Are you sure you want to delete "${state.deleting.name}"? This cannot be undone.`}
          onClose={() => state.setDeleting(null)}
          onConfirm={state.handleDelete}
        />
      ) : null}
    </>
  );
}
