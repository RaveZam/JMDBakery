# AdderModal Prop Removal (Clean Slate, UI Only) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip every prop from `AdderModal.tsx`, `AdderPanel.tsx`, and the four `adder-panel-components/` files so each component is fully self-contained with only its own local state.

**Architecture:** Each component becomes a standalone UI shell with zero external inputs — no props, no shared state across siblings, no callbacks bubbling up. `AdderPanel.tsx` becomes a pure layout composition of the four subcomponents. This intentionally drops real functionality (submit, product picking, BO gating) — it's a scaffolding pass, not a feature pass.

**Tech Stack:** Expo React Native, TypeScript.

## Global Constraints

- Zero props on all 6 files in scope: `AdderModal.tsx`, `AdderPanel.tsx`, `QtyStepper.tsx`, `ProductSelector.tsx`, `ReasonPicker.tsx`, `AddButton.tsx`.
- `PickerModal` integration is dropped from `ProductSelector` entirely (out of scope, needs external data this pass doesn't have).
- `AdderModal.tsx` keeps using `useAdderModal()` for `visible`/`close` (hook-owned state is not a prop).
- `AdderPanelProps` in `store-types.ts` is left in place (unused-type cleanup is out of scope).
- Verification: `npx tsc --noEmit` (no new errors beyond the pre-existing 4 unrelated ones) + `npx expo lint` (no new errors beyond pre-existing baseline) + `npm test` (all passing) after each task.

---

### Task 1: Strip `QtyStepper` down to zero props

**Files:**
- Modify: `apps/agent-app/src/features/store/components/adder-panel-components/QtyStepper.tsx`

**Interfaces:**
- Produces: `export function QtyStepper()` — no parameters, no props type.

- [ ] **Step 1: Rewrite the file with no props, own local state**

```tsx
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

const BORDER = "#E2E8F0";

export function QtyStepper() {
  const [value, setValue] = useState(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Quantity</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setValue((v) => Math.max(0, v - 1))}
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
            setValue(isNaN(n) || n < 0 ? 0 : n);
          }}
          selectTextOnFocus
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={() => setValue((v) => v + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnText}>+</Text>
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
  btnText: { fontSize: 22, color: "#475569", lineHeight: 28 },
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

- [ ] **Step 2: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/QtyStepper.tsx
git commit -m "refactor: strip QtyStepper to zero props, own local state"
```

---

### Task 2: Strip `ProductSelector` down to zero props, drop PickerModal

**Files:**
- Modify: `apps/agent-app/src/features/store/components/adder-panel-components/ProductSelector.tsx`

**Interfaces:**
- Produces: `export function ProductSelector()` — no parameters, no props type.

- [ ] **Step 1: Rewrite the file with no props, own local state, no PickerModal**

```tsx
import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BORDER = "#E2E8F0";

export function ProductSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.sectionLabel}>Product</Text>
      <TouchableOpacity
        style={styles.productDropdown}
        onPress={() => setSelected((s) => s ?? "Select product")}
        activeOpacity={0.8}
      >
        <View style={styles.productDropdownInner}>
          <Text style={styles.productName} numberOfLines={1}>
            {selected ?? "Select product"}
          </Text>
        </View>
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
  productChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF2F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

Note: `setSelected((s) => s ?? "Select product")` gives the tap a visible
local effect (first tap "selects" a placeholder name) without needing any
external product list — purely self-contained UI state.

- [ ] **Step 2: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/ProductSelector.tsx
git commit -m "refactor: strip ProductSelector to zero props, drop PickerModal"
```

---

### Task 3: Strip `ReasonPicker` down to zero props

**Files:**
- Modify: `apps/agent-app/src/features/store/components/adder-panel-components/ReasonPicker.tsx`

**Interfaces:**
- Produces: `export function ReasonPicker()` — no parameters, no props type. Keeps exporting `PRESET_REASONS` and `PresetReason` (used only internally now, but harmless to still export in case another file needs the constant).

- [ ] **Step 1: Rewrite the file with no props, own local state, always rendered**

```tsx
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

const BORDER = "#E2E8F0";

export const PRESET_REASONS = ["Rotten", "Damaged", "Lost", "Custom"] as const;
export type PresetReason = (typeof PRESET_REASONS)[number];

export function ReasonPicker() {
  const [reason, setReason] = useState<PresetReason>("Rotten");
  const [customReason, setCustomReason] = useState("");

  return (
    <View style={styles.reasonSection}>
      <Text style={styles.reasonTitle}>Reason</Text>
      <View style={styles.reasonChips}>
        {PRESET_REASONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, reason === r && styles.chipActive]}
            onPress={() => setReason(r)}
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
          onChangeText={setCustomReason}
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

- [ ] **Step 2: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/ReasonPicker.tsx
git commit -m "refactor: strip ReasonPicker to zero props, always rendered"
```

---

### Task 4: Strip `AddButton` down to zero props

**Files:**
- Modify: `apps/agent-app/src/features/store/components/adder-panel-components/AddButton.tsx`

**Interfaces:**
- Produces: `export function AddButton()` — no parameters, no props type.

- [ ] **Step 1: Rewrite the file with no props, static label, no-op press**

```tsx
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const HEADER_BG = "#0b4c29";

export function AddButton() {
  return (
    <TouchableOpacity
      style={styles.addBtn}
      activeOpacity={0.85}
      onPress={() => {}}
    >
      <Text style={styles.addBtnText}>Add to Order</Text>
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
  addBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/agent-app/src/features/store/components/adder-panel-components/AddButton.tsx
git commit -m "refactor: strip AddButton to zero props, static label"
```

---

### Task 5: Strip `AdderPanel` down to zero props (pure layout shell)

**Files:**
- Modify: `apps/agent-app/src/features/store/components/AdderPanel.tsx`

**Interfaces:**
- Consumes: `QtyStepper()` from `./adder-panel-components/QtyStepper`, `ProductSelector()` from `./adder-panel-components/ProductSelector`, `ReasonPicker()` from `./adder-panel-components/ReasonPicker`, `AddButton()` from `./adder-panel-components/AddButton` — all zero-arg per Tasks 1-4.
- Produces: `export function AdderPanel()` — no parameters, no props type.

- [ ] **Step 1: Rewrite the file as a pure layout composition**

```tsx
import { StyleSheet, View, Text } from "react-native";
import { QtyStepper } from "./adder-panel-components/QtyStepper";
import { ProductSelector } from "./adder-panel-components/ProductSelector";
import { ReasonPicker } from "./adder-panel-components/ReasonPicker";
import { AddButton } from "./adder-panel-components/AddButton";

const BORDER = "#E2E8F0";

export function AdderPanel() {
  return (
    <View style={styles.panel}>
      <ProductSelector />

      <View style={styles.stepperSection}>
        <QtyStepper />
      </View>

      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>Bad Order</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.stepperSection}>
        <QtyStepper />
      </View>

      <ReasonPicker />

      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 20 },

  stepperSection: {
    alignItems: "center",
    paddingVertical: 4,
  },

  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#CBD5E1",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
```

- [ ] **Step 2: Run typecheck**

Run: `cd apps/agent-app && npx tsc --noEmit`
Expected: the pre-existing `AdderModal.tsx(66,14)` error about missing `AdderPanelProps` fields is now GONE (since `AdderPanel` takes no props), leaving only the 3 unrelated pre-existing errors (`HistorySessionScreen.tsx` x2, `SoldOrderRow.test.tsx` x1).

- [ ] **Step 3: Run lint**

Run: `cd apps/agent-app && npx expo lint`
Expected: no new errors introduced in the 6 files touched by this plan (compare against the pre-existing baseline — `max-lines-per-function`/`complexity` counts should drop or stay flat, not increase).

- [ ] **Step 4: Run test suite**

Run: `cd apps/agent-app && npm test`
Expected: all existing tests still pass (71 passed prior to this plan).

- [ ] **Step 5: Commit**

```bash
git add apps/agent-app/src/features/store/components/AdderPanel.tsx
git commit -m "refactor: strip AdderPanel to zero props, pure layout shell"
```

---

### Task 6: Confirm `AdderModal.tsx` needs no changes

**Files:**
- Read only: `apps/agent-app/src/features/store/components/AdderModal.tsx`

- [ ] **Step 1: Read the file and confirm it already has zero props and calls `<AdderPanel />` with no props**

No code change expected — `AdderModal.tsx` already declares `export function AdderModal()` with no parameters and already renders `<AdderPanel />` with no props. This task is a verification checkpoint, not a code change.

- [ ] **Step 2: Run full verification one more time**

Run: `cd apps/agent-app && npx tsc --noEmit && npx expo lint && npm test`
Expected: same results as Task 5 Steps 2-4 — confirms the whole tree (`AdderModal` → `AdderPanel` → 4 subcomponents) is now fully prop-less end to end.
