import type { ReactElement } from "react";

import { Input } from "@/components/ui/input";

type PriceModifierFieldsProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  modifier: string;
  onModifierChange: (value: string) => void;
  modifierPlaceholder?: string;
};

export function PriceModifierFields({
  keyword,
  onKeywordChange,
  modifier,
  onModifierChange,
  modifierPlaceholder,
}: PriceModifierFieldsProps): ReactElement {
  return (
    <>
      <Input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Keyword"
        className="h-7 text-xs"
        aria-label="Keyword"
      />
      <Input
        type="number"
        step="0.01"
        value={modifier}
        onChange={(e) => onModifierChange(e.target.value)}
        placeholder={modifierPlaceholder}
        className="h-7 w-16 text-xs"
        aria-label="Price modifier"
      />
    </>
  );
}
