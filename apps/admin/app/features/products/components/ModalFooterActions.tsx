import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";

type ModalFooterActionsProps = {
  onCancel: () => void;
  submitLabel?: string;
};

export function ModalFooterActions({
  onCancel,
  submitLabel = "Save",
}: ModalFooterActionsProps): ReactElement {
  return (
    <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-2xl"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" className="rounded-2xl">
        {submitLabel}
      </Button>
    </div>
  );
}
