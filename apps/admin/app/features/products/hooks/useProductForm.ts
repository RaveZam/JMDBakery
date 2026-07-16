import type { FormEvent } from "react";
import { useState } from "react";

import type { ProductInput } from "../types/product-types";
import { validateProductInput } from "../helpers/validateProductInput";

type UseProductFormResult = {
  name: string;
  setName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  error: string | null;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function useProductForm(
  initialValues: ProductInput | undefined,
  onSubmit: (input: ProductInput) => void,
): UseProductFormResult {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [price, setPrice] = useState(
    initialValues ? String(initialValues.price) : "",
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const result = validateProductInput(name, price);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onSubmit(result.input);
  }

  return { name, setName, price, setPrice, error, handleSubmit };
}
