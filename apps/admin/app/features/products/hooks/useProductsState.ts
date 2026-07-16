import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import type { Product, ProductInput } from "../types/product-types";
import {
  addProduct,
  deleteProduct,
  updateProduct,
} from "../services/productsService";
import { removeProduct, replaceProduct } from "../helpers/productListOps";

type UseProductsStateResult = {
  products: Product[];
  addOpen: boolean;
  setAddOpen: Dispatch<SetStateAction<boolean>>;
  editing: Product | null;
  setEditing: Dispatch<SetStateAction<Product | null>>;
  deleting: Product | null;
  setDeleting: Dispatch<SetStateAction<Product | null>>;
  handleAdd: (input: ProductInput) => Promise<void>;
  handleSave: (input: ProductInput) => Promise<void>;
  handleDelete: () => Promise<void>;
};

export function useProductsState(
  initialProducts: Product[],
): UseProductsStateResult {
  const [products, setProducts] = useState(initialProducts);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  async function handleAdd(input: ProductInput): Promise<void> {
    const created = await addProduct(input);
    setProducts((prev) => [created, ...prev]);
  }

  async function handleSave(input: ProductInput): Promise<void> {
    if (!editing) return;
    await updateProduct(editing.id, input);
    setProducts((prev) => replaceProduct(prev, editing.id, input));
    setEditing(null);
  }

  async function handleDelete(): Promise<void> {
    if (!deleting) return;
    await deleteProduct(deleting.id);
    setProducts((prev) => removeProduct(prev, deleting.id));
  }

  return {
    products,
    addOpen,
    setAddOpen,
    editing,
    setEditing,
    deleting,
    setDeleting,
    handleAdd,
    handleSave,
    handleDelete,
  };
}
