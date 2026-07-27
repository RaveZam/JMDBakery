import type { ReactElement } from "react";

import type { usePriceModifiers } from "../hooks/usePriceModifiers";
import { PriceModifierRow } from "./PriceModifierRow";

type PriceModifierRowsListProps = {
  modifiers: ReturnType<typeof usePriceModifiers>;
};

export function PriceModifierRowsList({
  modifiers,
}: PriceModifierRowsListProps): ReactElement {
  if (modifiers.modifiers.loading) {
    return <p className="text-xs text-muted-foreground">Loading…</p>;
  }

  if (modifiers.modifiers.rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No keyword modifiers yet.</p>
    );
  }

  return (
    <>
      {modifiers.modifiers.rows.map((row) => (
        <PriceModifierRow
          key={row.id}
          row={row}
          isEditing={modifiers.editing.editingModifierId === row.id}
          onStartEditModifier={() => modifiers.editing.setEditingModifierId(row.id)}
          onCancelEditModifier={() => modifiers.editing.setEditingModifierId(null)}
          handleUpdate={(input) => modifiers.actions.handleUpdate(row.id, input)}
          onDelete={() => modifiers.actions.handleDelete(row.id)}
        />
      ))}
    </>
  );
}
