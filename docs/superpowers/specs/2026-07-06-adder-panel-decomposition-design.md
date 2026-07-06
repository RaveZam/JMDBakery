# AdderPanel Decomposition (UI-only)

## Context

`apps/agent-app/src/features/store/components/AdderPanel.tsx` is a single ~400-line
file mixing several presentational concerns: product selector, two quantity
steppers, a bad-order reason picker, and the submit button. The codebase has an
established convention for this — a `<screen>-components/` subfolder — already
used by `inventory/components/morning-inventory-screen-components/`.

This is a pure UI decomposition. No state, hooks, or data-flow logic changes;
`AdderPanel.tsx` keeps owning all state and `handleAdd` logic and simply wires
props down into the extracted pieces.

## Decision

Create `store/components/adder-panel-components/` with:

- **`QtyStepper.tsx`** — extracted as-is (label, −/+ buttons, editable numeric
  value, optional accent/autoFocus). Already has two call sites (sold qty, BO
  qty), so it earns its own file under the "2+ real call sites" rule.
- **`ProductSelector.tsx`** — product dropdown row (name, optional price,
  "N left" remaining badge, chevron). Presentational; `onPress` opens the
  existing `PickerModal`.
- **`ReasonPicker.tsx`** — BO reason chips (`Rotten/Damaged/Lost/Custom`) plus
  the custom-reason `TextInput`, rendered only when `boQty > 0`.
- **`AddButton.tsx`** — submit button with the sold/BO summary subtext.

Each file keeps its own co-located `StyleSheet.create()`, matching how
`QtyStepper` already does it today. Prop types are declared inline per file
(same pattern `QtyStepper` already uses), not added to `store-types.ts`, since
these are internal presentational props, not shared domain types.

The "Bad Order" section divider stays inline in `AdderPanel.tsx` (3 lines, not
worth a file). All state (`selected`, `qty`, `boQty`, `reason`, `customReason`,
`pickerOpen`) and `handleAdd` remain in `AdderPanel.tsx`, which becomes the
container composing the four new components plus the divider and
`PickerModal`.

## Consequences

- `AdderPanel.tsx` shrinks to a container that composes subcomponents and owns
  state — easier to read, matches the rest of the codebase's screen/component
  split.
- No behavior change: same props, same rendered output, same styles values.
- Slight increase in file count (4 new files), consistent with the existing
  `morning-inventory-screen-components/` precedent.
