import type { ReactElement } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type PriceModifierEditActionsProps = {
  onSave: () => void;
  onCancel: () => void;
};

export function PriceModifierEditActions({
  onSave,
  onCancel,
}: PriceModifierEditActionsProps): ReactElement {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Save"
        onClick={onSave}
      >
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Cancel"
        onClick={onCancel}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}
