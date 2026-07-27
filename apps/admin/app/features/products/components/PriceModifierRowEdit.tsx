import { type ReactElement, useState } from "react";

import type { PriceModifier, PriceModifierInput } from "../types/product-types";
import { submitPriceModifierForm } from "../helpers/submitPriceModifierForm";
import { PriceModifierEditActions } from "./PriceModifierEditActions";
import { PriceModifierFields } from "./PriceModifierFields";

type PriceModifierRowEditProps = {
  row: PriceModifier;
  handleUpdate: (input: PriceModifierInput) => void;
  onCancel: () => void;
};

export function PriceModifierRowEdit({
  row,
  handleUpdate,
  onCancel,
}: PriceModifierRowEditProps): ReactElement {
  const [keyword, setKeyword] = useState(row.keyword);
  const [modifier, setModifier] = useState(String(row.modifier));
  const [error, setError] = useState<string | null>(null);

  function handleSave(): void {
    submitPriceModifierForm(keyword, modifier, handleUpdate, setError);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <PriceModifierFields
          keyword={keyword}
          onKeywordChange={setKeyword}
          modifier={modifier}
          onModifierChange={setModifier}
        />
        <PriceModifierEditActions onSave={handleSave} onCancel={onCancel} />
      </div>
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
