# AdderModal Family: Prop Removal (Clean Slate, UI Only)

## Context

The store feature is mid-rebuild: `StorePageContent.tsx` already renders
`<StoreHeader />` and `<AdderModal />` with zero props, and most of the old
prop-driven UI is commented out. `AdderModal.tsx` itself already takes no
props and already renders `<AdderPanel />` with no props (which currently
produces a type error, since `AdderPanel` still declares `AdderPanelProps`).

The goal of this pass is to finish that transition for the whole AdderModal
render tree: every component in scope stops accepting props entirely and
manages only its own local state. This is a UI-only pass — no data wiring,
no context wiring, no real submit/select behavior. It intentionally produces
a decoupled, visually-similar-but-functionally-inert component tree, to be
wired up again in a later pass (likely via the `ProductQuantityContext` stub
already scaffolded in `store/context/`).

## Scope

Files: `AdderModal.tsx`, `AdderPanel.tsx`, and all four files in
`adder-panel-components/` (`QtyStepper.tsx`, `ProductSelector.tsx`,
`ReasonPicker.tsx`, `AddButton.tsx`).

Out of scope: `PickerModal` (shared component, not part of this feature),
`useAdderModal` hook, `store-types.ts` (its now-unused `AdderPanelProps` type
is left in place — cleanup of unused types is a separate concern from this
UI pass).

## Decision

- **`AdderModal.tsx`** — unchanged in spirit: no props, keeps using
  `useAdderModal()` for `visible`/`close` (hook-owned state, not a prop).
  Renders `<AdderPanel />`.
- **`AdderPanel.tsx`** — drops `AdderPanelProps` and all destructured props.
  Becomes a pure layout shell composing `<ProductSelector />`, `<QtyStepper />`
  (sold), the "Bad Order" divider, `<QtyStepper />` (BO), `<ReasonPicker />`,
  `<AddButton />`. No shared state, no `handleAdd`, no `canAdd`.
- **`QtyStepper`** — no props. Both call sites render identically: a generic
  `"Quantity"` label, default (non-accent) styling, each instance with its own
  independent `useState(0)`. The sold/BO label and accent distinction is
  dropped for this pass.
- **`ProductSelector`** — no props. Drops the `PickerModal` integration
  (that modal needs a product list, `remainingByProduct`, and `onSelected`
  callback — none of which this pass has a source for). Renders a static-look
  dropdown row with its own local `selected` state (`null` initially, shows
  "Select product" placeholder). Tapping it may toggle local UI state only;
  no modal opens.
- **`ReasonPicker`** — no props. Owns `reason` and `customReason` locally.
  Always renders (previously gated on a sibling's `boQty > 0`, which no
  longer exists). The custom text input still conditionally shows based on
  its own `reason === "Custom"` state.
- **`AddButton`** — no props. Static "Add to Order" label only (drops the
  edit-mode "Save Changes" variant and the sold/BO summary subtext, both of
  which needed sibling data). `onPress` is a no-op stub.

## Consequences

- No real submit, product selection, or bad-order gating remains after this
  pass — by design. This is intentionally a scaffolding step, not a
  regression to fix.
- `AdderPanelProps` in `store-types.ts` becomes unused; left in place per
  scope (not a UI file).
- Sets up a clean, fully decoupled component tree for a future context-wiring
  pass.
