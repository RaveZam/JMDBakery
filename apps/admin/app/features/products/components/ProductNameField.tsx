import type { ReactElement } from "react";

import { Input } from "@/components/ui/input";

type ProductNameFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductNameField({
  value,
  onChange,
}: ProductNameFieldProps): ReactElement {
  return (
    <div>
      <label
        htmlFor="product-name"
        className="mb-1 block text-xs font-medium text-muted-foreground"
      >
        Name
      </label>
      <Input
        id="product-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}
