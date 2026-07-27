import type { ReactElement } from "react";

import type { PriceModifier, PriceModifierInput } from "../types/product-types";
import { PriceModifierRowEdit } from "./PriceModifierRowEdit";
import { PriceModifierRowView } from "./PriceModifierRowView";

type PriceModifierRowProps = {
  row: PriceModifier;
  isEditing: boolean;
  onStartEditModifier: () => void;
  onCancelEditModifier: () => void;
  handleUpdate: (input: PriceModifierInput) => void;
  onDelete: () => void;
};

export function PriceModifierRow({
  row,
  isEditing,
  onStartEditModifier,
  onCancelEditModifier,
  handleUpdate,
  onDelete,
}: PriceModifierRowProps): ReactElement {
  if (isEditing) {
    return (
      <PriceModifierRowEdit
        row={row}
        handleUpdate={handleUpdate}
        onCancel={onCancelEditModifier}
      />
    );
  }

  return (
    <PriceModifierRowView
      row={row}
      onStartEditModifier={onStartEditModifier}
      onDelete={onDelete}
    />
  );
}
