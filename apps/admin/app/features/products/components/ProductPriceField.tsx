import type { ReactElement } from "react";

import { Input } from "@/components/ui/input";

type ProductPriceFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductPriceField({
  value,
  onChange,
}: ProductPriceFieldProps): ReactElement {
  return (
    <div>
      <label
        htmlFor="product-price"
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        Price
      </label>
      <Input
        id="product-price"
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
