import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PickerModal } from "@/src/shared/components/PickerModal";
import { useMorningInventory } from "../../context/useMorningInventory";

const HEADER_BG = "#0b4c29";

type Props = {
  visible: boolean;
  onClose: () => void;
  editing: boolean;
  editProductId?: string | null;
};

export function InventoryAdderModal({
  visible,
  onClose,
  editing,
  editProductId,
}: Props) {
  const { inventory } = useMorningInventory();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [qty, setQty] = useState(1);

  // Seed selection + qty each time the sheet opens: an edit sheet starts on the
  // row's product and its stored qty; an add sheet starts empty.
  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setSelectedProductId(editProductId ?? null);
      const item = inventory.items.find((it) => it.productId === editProductId);
      setQty(item?.qty ?? 1);
    } else {
      setSelectedProductId(null);
      setQty(1);
    }
  }, [visible, editing, editProductId, inventory.items]);

  const selectedProduct = inventory.products.find(
    (p) => p.id === selectedProductId,
  );
  const canAdd = selectedProduct && qty > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheetWrapper}>
        <KeyboardAvoidingView
          style={styles.sheet}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {editing ? "Edit Product" : "Add Product"}
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetBody}>
            <Text style={styles.fieldLabel}>Product</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText} numberOfLines={1}>
                {selectedProduct?.name ?? "Select product"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.stepperWrap}>
              <Text style={styles.fieldLabel}>Quantity</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.stepValue}
                  keyboardType="number-pad"
                  value={String(qty)}
                  onChangeText={(v) => {
                    const n = parseInt(v, 10);
                    setQty(isNaN(n) || n < 1 ? 1 : n);
                  }}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setQty((q) => q + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmAdd, !canAdd && styles.confirmAddDisabled]}
              activeOpacity={0.85}
              disabled={!canAdd}
              onPress={() => {
                if (!selectedProductId) return;
                // Editing sets the row to an exact qty; adding accumulates onto
                // whatever's already logged for that product instead of replacing it.
                if (editing) {
                  inventory.setItemQty(selectedProductId, qty);
                } else {
                  inventory.adjustItemQty(selectedProductId, qty);
                }
                onClose();
              }}
            >
              <Text style={styles.confirmAddText}>
                {editing ? "Update" : "Add to Inventory"}
              </Text>
            </TouchableOpacity>
          </View>

          <PickerModal
            visible={pickerOpen}
            products={inventory.products}
            showPrice={true}
            onSelected={(p) => setSelectedProductId(p.id)}
            onClose={() => setPickerOpen(false)}
          />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheetWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: HEADER_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    elevation: 24,
  },
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 18,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F172A" },
  stepperWrap: { alignItems: "center", gap: 10 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { fontSize: 22, color: "#475569", lineHeight: 28 },
  stepValue: {
    width: 60,
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2,
  },
  confirmAdd: {
    backgroundColor: HEADER_BG,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmAddDisabled: { opacity: 0.35 },
  confirmAddText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
