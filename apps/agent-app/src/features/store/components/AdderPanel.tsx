import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PickerModal } from "../../../shared/components/PickerModal";
import type { AdderPanelProps, Product } from "../types/store-types";

const HEADER_BG = "#0b4c29";
const BORDER = "#E2E8F0";

const PRESET_REASONS = ["Rotten", "Damaged", "Lost", "Custom"] as const;
type PresetReason = (typeof PRESET_REASONS)[number];

function QtyStepper({
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
    <View style={stepperStyles.wrap}>
      <Text style={[stepperStyles.label, accent && stepperStyles.labelAccent]}>
        {label}
      </Text>
      <View style={stepperStyles.row}>
        <TouchableOpacity
          style={stepperStyles.btn}
          onPress={() => onChange(Math.max(0, value - 1))}
          activeOpacity={0.7}
        >
          <Text style={stepperStyles.btnText}>−</Text>
        </TouchableOpacity>

        <TextInput
          style={stepperStyles.value}
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
          style={[stepperStyles.btn, accent && stepperStyles.btnAccent]}
          onPress={() => onChange(value + 1)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              stepperStyles.btnText,
              accent && stepperStyles.btnTextAccent,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepperStyles = StyleSheet.create({
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
      {/* Product selector */}
      <View style={styles.productSection}>
        <Text style={styles.sectionLabel}>Product</Text>
        <TouchableOpacity
          style={styles.productDropdown}
          onPress={() => setPickerOpen(true)}
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

      {/* Sold qty */}
      <View style={styles.stepperSection}>
        <QtyStepper label="Sold qty" value={qty} onChange={setQty} autoFocus />
      </View>

      {/* Bad order divider */}
      <View style={styles.sectionDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>Bad Order</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* BO qty */}
      <View style={styles.stepperSection}>
        <QtyStepper
          label="Bad order qty"
          value={boQty}
          onChange={setBoQty}
          accent={boQty > 0}
        />
      </View>

      {/* Reason picker (only when BO > 0) */}
      {boQty > 0 && (
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
                  style={[
                    styles.chipText,
                    reason === r && styles.chipTextActive,
                  ]}
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
      )}

      {/* Add button */}
      <TouchableOpacity
        style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
        activeOpacity={0.85}
        onPress={handleAdd}
        disabled={!canAdd}
      >
        <Text style={styles.addBtnText}>
          {editData ? "Save Changes" : "Add to Order"}
        </Text>
        {selected && canAdd && (
          <Text style={styles.addBtnSub}>
            {selected.name}
            {qty > 0 ? `  ·  ${qty} sold` : ""}
            {boQty > 0 ? `  ·  ${boQty} BO` : ""}
          </Text>
        )}
      </TouchableOpacity>

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

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  productSection: {},
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
