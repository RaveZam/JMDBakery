import { type ReactElement, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PriceModifierInput } from "../types/product-types";
import { submitPriceModifierForm } from "../helpers/submitPriceModifierForm";
import { PriceModifierFields } from "./PriceModifierFields";

type PriceModifierAddRowProps = {
  onAdd: (input: PriceModifierInput) => void;
};

export function PriceModifierAddRow({
  onAdd,
}: PriceModifierAddRowProps): ReactElement {
  const [keyword, setKeyword] = useState("");
  const [modifier, setModifier] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdded(input: PriceModifierInput): void {
    onAdd(input);
    setKeyword("");
    setModifier("");
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <PriceModifierFields
          keyword={keyword}
          onKeywordChange={setKeyword}
          modifier={modifier}
          onModifierChange={setModifier}
          modifierPlaceholder="±0.00"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Add keyword modifier"
          onClick={() => submitPriceModifierForm(keyword, modifier, handleAdded, setError)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
