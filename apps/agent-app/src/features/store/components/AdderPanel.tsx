import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { PickerModal } from "../../../shared/components/PickerModal";
import { QtyStepper } from "./adder-panel-components/QtyStepper";
import { ProductSelector } from "./adder-panel-components/ProductSelector";
import {
  ReasonPicker,
  PRESET_REASONS,
  type PresetReason,
} from "./adder-panel-components/ReasonPicker";
import { AddButton } from "./adder-panel-components/AddButton";
import type { AdderPanelProps, Product } from "../types/store-types";

const BORDER = "#E2E8F0";

export function AdderPanel({
  products,
  showPrice,
  editData,
  remainingByProduct,
  onAdd,
}: AdderPanelProps) {
  const initProduct = editData
    ? (products.find((p) => p.id === editData.productId) ?? products[0])
    : products[0];
  const initReason = PRESET_REASONS.includes(editData?.boReason as PresetReason)
    ? (editData!.boReason as PresetReason)
    : editData?.boReason
      ? "Custom"
      : "Rotten";

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Product>(initProduct);
  const [qty, setQty] = useState(editData?.qty ?? 1);
  const [boQty, setBoQty] = useState(editData?.boQty ?? 0);
  const [reason, setReason] = useState<PresetReason>(initReason);
  const [customReason, setCustomReason] = useState(
    initReason === "Custom" ? (editData?.boReason ?? "") : "",
  );

  const remaining = selected ? remainingByProduct?.[selected.id] : undefined;

  function handleAdd() {
    if (!selected || (qty === 0 && boQty === 0)) return;
    const boReason =
      boQty > 0
        ? reason === "Custom"
          ? customReason.trim() || "Custom"
          : reason
        : undefined;
    onAdd(selected.id, qty, boQty, boReason);
    setQty(1);
    setBoQty(0);
    setReason("Rotten");
    setCustomReason("");
  }

  const canAdd = qty > 0 || boQty > 0;

  return (
    <View style={styles.panel}>
      <ProductSelector
        selected={selected}
        showPrice={showPrice}
        remaining={remaining}
        onPress={() => setPickerOpen(true)}
      />

      <View style={styles.stepperSection}>
        <QtyStepper label="Sold qty" value={qty} onChange={setQty} autoFocus />
      </View>

      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>Bad Order</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.stepperSection}>
        <QtyStepper
          label="Bad order qty"
          value={boQty}
          onChange={setBoQty}
          accent={boQty > 0}
        />
      </View>

      {boQty > 0 && (
        <ReasonPicker
          reason={reason}
          customReason={customReason}
          onReasonChange={setReason}
          onCustomReasonChange={setCustomReason}
        />
      )}

      <AddButton
        isEdit={!!editData}
        selected={selected}
        qty={qty}
        boQty={boQty}
        canAdd={canAdd}
        onPress={handleAdd}
      />

      <PickerModal
        visible={pickerOpen}
        products={products}
        showPrice={showPrice}
        remainingByProduct={remainingByProduct}
        onSelected={setSelected}
        onClose={() => setPickerOpen(false)}
      />
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
