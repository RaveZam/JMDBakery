"use client";

import type { ReactElement } from "react";
import { useId } from "react";
import { createPortal } from "react-dom";

import type { ProductInput } from "../types/product-types";
import { useModalDismiss } from "../hooks/useModalDismiss";
import { useProductForm } from "../hooks/useProductForm";
import { ModalDialog } from "./ModalDialog";
import { ModalFooterActions } from "./ModalFooterActions";
import { ProductFormFields } from "./ProductFormFields";

type ProductFormModalProps = {
  title?: string;
  initialValues?: ProductInput;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
};

export function ProductFormModal({
  title = "Add Product",
  initialValues,
  onClose,
  onSubmit,
}: ProductFormModalProps): ReactElement | null {
  const titleId = `${useId()}-title`;
  const form = useProductForm(initialValues, (input) => {
    onSubmit(input);
    onClose();
  });

  useModalDismiss(onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <ModalDialog titleId={titleId} onClose={onClose}>
      <form onSubmit={form.handleSubmit}>
        <div className="px-5 pt-5 pb-4">
          <h2 id={titleId} className="text-sm font-semibold">
            {title}
          </h2>
          <ProductFormFields
            name={form.name}
            onNameChange={form.setName}
            price={form.price}
            onPriceChange={form.setPrice}
            error={form.error}
          />
        </div>
        <ModalFooterActions onCancel={onClose} />
      </form>
    </ModalDialog>,
    document.body,
  );
}
