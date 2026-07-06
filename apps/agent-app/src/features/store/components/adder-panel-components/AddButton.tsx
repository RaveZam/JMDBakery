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
