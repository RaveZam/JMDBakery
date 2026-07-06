# AdderPanel Decomposition (UI-only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Break `AdderPanel.tsx` into four presentational subcomponents (`QtyStepper`, `ProductSelector`, `ReasonPicker`, `AddButton`) under a new `adder-panel-components/` folder, with zero behavior change.

**Architecture:** Pure extraction. `AdderPanel.tsx` keeps all state (`selected`, `qty`, `boQty`, `reason`, `customReason`, `pickerOpen`) and `handleAdd`, and becomes a container that composes the four new components. Each new file is self-contained: its own inline prop type + its own co-located `StyleSheet.create()`, mirroring how `QtyStepper` is written today.

**Tech Stack:** Expo React Native, TypeScript, `@expo/vector-icons` (Ionicons).

## Global Constraints

- No behavior change: same rendered output, same prop values, same styling (colors/sizes copied verbatim from current `AdderPanel.tsx`).
- Prop types declared inline per file (not added to `store-types.ts`) — these are internal presentational props, not shared domain types.
- Folder: `apps/agent-app/src/features/store/components/adder-panel-components/`.
- The divider block ("Bad Order" section separator) stays inline in `AdderPanel.tsx`.
- Verification is type-check + lint + existing test suite (no new tests — this is a behavior-preserving refactor, not new functionality).

---

### Task 1: Extract `QtyStepper`

**Files:**
- Create: `apps/agent-app/src/features/store/components/adder-panel-components/QtyStepper.tsx`
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx`

**Interfaces:**
- Produces: `export function QtyStepper({ label, value, onChange, accent, autoFocus }: { label: string; value: number; onChange: (n: number) => void; accent?: boolean; autoFocus?: boolean })`

- [ ] **Step 1: Create the file with the extracted component**

```tsx
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";

const BORDER = "#E2E8F0";

export function QtyStepper({
  label,
  value,
  onChange,
  accent,
  autoFocus,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  accent?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, accent && styles.labelAccent]}>
        {label}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.max(0, value - 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.value}
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={(v) => {
            const n = parseInt(v, 10);
            onChange(isNaN(n) || n < 0 ? 0 : n);
          }}
          selectTextOnFocus
          autoFocus={autoFocus}
        />

        <TouchableOpacity
          style={[styles.btn, accent && styles.btnAccent]}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, accent && styles.btnTextAccent]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 10 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  labelAccent: { color: "#F97316" },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  btnAccent: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },
  btnText: { fontSize: 22, color: "#475569", lineHeight: 28 },
  btnTextAccent: { color: "#F97316" },
  value: {
    width: 60,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: BORDER,
    paddingBottom: 2,
  },
});
```

- [ ] **Step 2: Remove `QtyStepper` + `stepperStyles` from `AdderPanel.tsx` and import it instead**

In `AdderPanel.tsx`: delete the `QtyStepper` function (lines 19-75) and the `stepperStyles` StyleSheet (lines 77-114) entirely. Add the import:

```tsx
import { QtyStepper } from "./adder-panel-components/QtyStepper";
```

- [ ] **Step 3: Run typecheck**

Run: `cd apps/agent-app && npx tsc --noEmit`
Expected: no new errors (there will still be errors from the two other not-yet-extracted pieces referencing removed code — ignore those until Task 4 is done; if `QtyStepper` alone compiles clean in isolation, that's the pass condition for this step).

- [ ] **Step 4: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/QtyStepper.tsx apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: extract QtyStepper from AdderPanel"
```

---

### Task 2: Extract `ProductSelector`

**Files:**
- Create: `apps/agent-app/src/features/store/components/adder-panel-components/ProductSelector.tsx`
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx`

**Interfaces:**
- Consumes: `Product` type from `apps/agent-app/src/features/store/types/store-types.ts`
- Produces: `export function ProductSelector({ selected, showPrice, remaining, onPress }: { selected: Product | undefined; showPrice: boolean; remaining: number | undefined; onPress: () => void })`

- [ ] **Step 1: Create the file with the extracted product dropdown**

```tsx
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../../types/store-types";

const BORDER = "#E2E8F0";

export function ProductSelector({
  selected,
  showPrice,
  remaining,
  onPress,
}: {
  selected: Product | undefined;
  showPrice: boolean;
  remaining: number | undefined;
  onPress: () => void;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Product</Text>
      <TouchableOpacity
        style={styles.productDropdown}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.productDropdownInner}>
          <Text style={styles.productName} numberOfLines={1}>
            {selected?.name ?? "Select product"}
          </Text>
          {selected && showPrice && (
            <Text style={styles.productPrice}>₱{selected.price} / pack</Text>
          )}
        </View>
        {remaining !== undefined && (
          <View
            style={[
              styles.remainingBadge,
              remaining <= 0 && styles.remainingBadgeEmpty,
            ]}
          >
            <Text
              style={[
                styles.remainingText,
                remaining <= 0 && styles.remainingTextEmpty,
              ]}
            >
              {remaining} left
            </Text>
          </View>
        )}
        <View style={styles.productChevron}>
          <Ionicons name="chevron-down" size={16} color="#64748B" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  productDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  productDropdownInner: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  productPrice: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  productChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF2F5",
    alignItems: "center",
    justifyContent: "center",
  },
  remainingBadge: {
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  remainingBadgeEmpty: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  remainingText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
  remainingTextEmpty: { color: "#DC2626" },
});
```

- [ ] **Step 2: Replace the inline product selector block in `AdderPanel.tsx`**

Remove the `{/* Product selector */}` `<View style={styles.productSection}>...</View>` block (original lines 162-199) and replace with:

```tsx
<ProductSelector
  selected={selected}
  showPrice={showPrice}
  remaining={remaining}
  onPress={() => setPickerOpen(true)}
/>
```

Add the import:

```tsx
import { ProductSelector } from "./adder-panel-components/ProductSelector";
```

Remove the now-unused style keys from `AdderPanel.tsx`'s `styles`: `sectionLabel` (if not used elsewhere — check it isn't; the `reasonTitle`/`dividerLabel` styles are separate), `productSection`, `productDropdown`, `productDropdownInner`, `productName`, `productPrice`, `productChevron`, `remainingBadge`, `remainingBadgeEmpty`, `remainingText`, `remainingTextEmpty`.

- [ ] **Step 3: Run typecheck**

Run: `cd apps/agent-app && npx tsc --noEmit`
Expected: no errors related to `ProductSelector` or `AdderPanel`'s product section.

- [ ] **Step 4: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/ProductSelector.tsx apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: extract ProductSelector from AdderPanel"
```

---

### Task 3: Extract `ReasonPicker`

**Files:**
- Create: `apps/agent-app/src/features/store/components/adder-panel-components/ReasonPicker.tsx`
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx`

**Interfaces:**
- Produces: `export const PRESET_REASONS = ["Rotten", "Damaged", "Lost", "Custom"] as const; export type PresetReason = (typeof PRESET_REASONS)[number]; export function ReasonPicker({ reason, customReason, onReasonChange, onCustomReasonChange }: { reason: PresetReason; customReason: string; onReasonChange: (r: PresetReason) => void; onCustomReasonChange: (v: string) => void })`

`PRESET_REASONS` and `PresetReason` move here from `AdderPanel.tsx` since they're only meaningful in the context of this picker; `AdderPanel.tsx` will import them back for its own state typing and `initReason` logic.

- [ ] **Step 1: Create the file with the extracted reason picker**

```tsx
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";

const BORDER = "#E2E8F0";

export const PRESET_REASONS = ["Rotten", "Damaged", "Lost", "Custom"] as const;
export type PresetReason = (typeof PRESET_REASONS)[number];

export function ReasonPicker({
  reason,
  customReason,
  onReasonChange,
  onCustomReasonChange,
}: {
  reason: PresetReason;
  customReason: string;
  onReasonChange: (r: PresetReason) => void;
  onCustomReasonChange: (v: string) => void;
}) {
  return (
    <View style={styles.reasonSection}>
      <Text style={styles.reasonTitle}>Reason</Text>
      <View style={styles.reasonChips}>
        {PRESET_REASONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, reason === r && styles.chipActive]}
            onPress={() => onReasonChange(r)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.chipText, reason === r && styles.chipTextActive]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {reason === "Custom" && (
        <TextInput
          style={styles.customInput}
          placeholder="Describe the reason…"
          placeholderTextColor="#94A3B8"
          value={customReason}
          onChangeText={onCustomReasonChange}
          autoFocus
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reasonSection: { gap: 10 },
  reasonTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  reasonChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  chipText: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  chipTextActive: { color: "#F97316", fontWeight: "700" },
  customInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0F172A",
  },
});
```

- [ ] **Step 2: Replace the inline reason section in `AdderPanel.tsx`, and import `PRESET_REASONS`/`PresetReason` from the new file**

Remove the local `const PRESET_REASONS = [...] as const; type PresetReason = ...;` declaration from `AdderPanel.tsx` (original lines 16-17). Replace the `{/* Reason picker ... */}` block (original lines 224-257) with:

```tsx
{boQty > 0 && (
  <ReasonPicker
    reason={reason}
    customReason={customReason}
    onReasonChange={setReason}
    onCustomReasonChange={setCustomReason}
  />
)}
```

Add the import (this replaces the old local `PRESET_REASONS`/`PresetReason` declarations):

```tsx
import { ReasonPicker, PRESET_REASONS, type PresetReason } from "./adder-panel-components/ReasonPicker";
```

Remove the now-unused style keys from `AdderPanel.tsx`'s `styles`: `reasonSection`, `reasonTitle`, `reasonChips`, `chip`, `chipActive`, `chipText`, `chipTextActive`, `customInput`.

- [ ] **Step 3: Run typecheck**

Run: `cd apps/agent-app && npx tsc --noEmit`
Expected: no errors related to `ReasonPicker` or `AdderPanel`'s reason section.

- [ ] **Step 4: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/ReasonPicker.tsx apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: extract ReasonPicker from AdderPanel"
```

---

### Task 4: Extract `AddButton`

**Files:**
- Create: `apps/agent-app/src/features/store/components/adder-panel-components/AddButton.tsx`
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx`

**Interfaces:**
- Consumes: `Product` type from `apps/agent-app/src/features/store/types/store-types.ts`
- Produces: `export function AddButton({ isEdit, selected, qty, boQty, canAdd, onPress }: { isEdit: boolean; selected: Product | undefined; qty: number; boQty: number; canAdd: boolean; onPress: () => void })`

- [ ] **Step 1: Create the file with the extracted submit button**

```tsx
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import type { Product } from "../../types/store-types";

const HEADER_BG = "#0b4c29";

export function AddButton({
  isEdit,
  selected,
  qty,
  boQty,
  canAdd,
  onPress,
}: {
  isEdit: boolean;
  selected: Product | undefined;
  qty: number;
  boQty: number;
  canAdd: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!canAdd}
    >
      <Text style={styles.addBtnText}>
        {isEdit ? "Save Changes" : "Add to Order"}
      </Text>
      {selected && canAdd && (
        <Text style={styles.addBtnSub}>
          {selected.name}
          {qty > 0 ? `  ·  ${qty} sold` : ""}
          {boQty > 0 ? `  ·  ${boQty} BO` : ""}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: HEADER_BG,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    gap: 3,
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  addBtnSub: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
});
```

- [ ] **Step 2: Replace the inline add button in `AdderPanel.tsx`**

Replace the `{/* Add button */}` `<TouchableOpacity>...</TouchableOpacity>` block (original lines 260-276) with:

```tsx
<AddButton
  isEdit={!!editData}
  selected={selected}
  qty={qty}
  boQty={boQty}
  canAdd={canAdd}
  onPress={handleAdd}
/>
```

Add the import:

```tsx
import { AddButton } from "./adder-panel-components/AddButton";
```

Remove the now-unused style keys from `AdderPanel.tsx`'s `styles`: `addBtn`, `addBtnDisabled`, `addBtnText`, `addBtnSub`.

- [ ] **Step 3: Run typecheck and lint on the whole file**

Run: `cd apps/agent-app && npx tsc --noEmit && npx expo lint`
Expected: no errors. `AdderPanel.tsx` should now only retain: `panel`, `stepperSection`, `sectionDivider`, `dividerLine`, `dividerLabel` in its `styles` object (everything else moved out).

- [ ] **Step 4: Run the existing test suite to confirm no regressions**

Run: `cd apps/agent-app && npm test`
Expected: all existing tests pass (in particular `SoldOrderRow.test.tsx` and `count-sold-by-product.test.ts`, which are unrelated to this file but confirm the test runner and no accidental breakage).

- [ ] **Step 5: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/AddButton.tsx apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: extract AddButton from AdderPanel"
```

---

### Task 5: Final review pass on `AdderPanel.tsx`

**Files:**
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx` (review only, no functional changes expected)

- [ ] **Step 1: Read the final `AdderPanel.tsx` top to bottom**

Confirm it now reads as a container: imports the four new components, keeps `initProduct`/`initReason` derivation, `useState` calls, `remaining` computation, `handleAdd`, `canAdd`, and composes `ProductSelector`, `QtyStepper` (×2), the inline divider, `ReasonPicker`, `AddButton`, and `PickerModal` in the same order as the original JSX.

- [ ] **Step 2: Confirm no dead code remains**

Run: `cd apps/agent-app && npx tsc --noEmit --noUnusedLocals`
Expected: no unused-variable errors in `AdderPanel.tsx` (e.g. leftover unused style keys or unused imports from the extractions above).

- [ ] **Step 3: Commit if any cleanup was needed**

```bash
git add apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: clean up AdderPanel after component extraction"
```

(Skip this commit if Step 2 found nothing to clean up.)
