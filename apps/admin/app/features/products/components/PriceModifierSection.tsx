import type { ReactElement } from "react";

import { usePriceModifiers } from "../hooks/usePriceModifiers";
import { PriceModifierAddRow } from "./PriceModifierAddRow";
import { PriceModifierRowsList } from "./PriceModifierRowsList";

type PriceModifierSectionProps = {
  productId: string;
};

export function PriceModifierSection({
  productId,
}: PriceModifierSectionProps): ReactElement {
  const modifiers = usePriceModifiers(productId);

  return (
    <div className="mt-4 space-y-2 border-t border-dashed border-border pt-4">
      <p className="text-xs font-medium text-muted-foreground">
        Price modifiers
      </p>

      <PriceModifierRowsList modifiers={modifiers} />

      <PriceModifierAddRow onAdd={modifiers.actions.handleAdd} />
      {modifiers.modifiers.error ? (
        <p className="text-xs text-red-600 dark:text-red-400">
          {modifiers.modifiers.error}
        </p>
      ) : null}
    </div>
  );
}
