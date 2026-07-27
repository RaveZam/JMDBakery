import type { ReactElement } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PriceModifier } from "../types/product-types";

type PriceModifierRowViewProps = {
  row: PriceModifier;
  onStartEditModifier: () => void;
  onDelete: () => void;
};

export function PriceModifierRowView({
  row,
  onStartEditModifier,
  onDelete,
}: PriceModifierRowViewProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-1.5 text-xs">
      <span className="truncate text-foreground">{row.keyword}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-[family-name:var(--font-mono)] tabular-nums text-muted-foreground">
          {row.modifier > 0 ? `+${row.modifier}` : row.modifier}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label={`Edit ${row.keyword}`}
          onClick={onStartEditModifier}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label={`Delete ${row.keyword}`}
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
        </Button>
      </div>
    </div>
  );
}
