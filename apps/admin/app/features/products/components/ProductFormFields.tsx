import type { ReactElement } from "react";

import { ProductNameField } from "./ProductNameField";
import { ProductPriceField } from "./ProductPriceField";

type ProductFormFieldsProps = {
  name: string;
  onNameChange: (value: string) => void;
  price: string;
  onPriceChange: (value: string) => void;
  error: string | null;
};

export function ProductFormFields({
  name,
  onNameChange,
  price,
  onPriceChange,
  error,
}: ProductFormFieldsProps): ReactElement {
  return (
    <div className="mt-4 space-y-3">
      <ProductNameField value={name} onChange={onNameChange} />
      <ProductPriceField value={price} onChange={onPriceChange} />
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
