import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Product } from "../../types/store-types";
import { useProductQuantity } from "../../context/useProductQuantity";

const BORDER = "#E2E8F0";

export function ProductSelector() {
  const { adderModal } = useProductQuantity();

  const [listOpen, setListOpen] = useState(false);

  return (
    <View>
      <Text style={styles.sectionLabel}>Product</Text>
      <TouchableOpacity
        style={styles.productDropdown}
        onPress={() => setListOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.productDropdownInner}>
          <Text style={styles.productName} numberOfLines={1}>
            {adderModal.inventory.selectedProduct?.name ?? "Select product"}
          </Text>
        </View>
        <View style={styles.productChevron}>
          <Ionicons name="chevron-down" size={16} color="#64748B" />
        </View>
      </TouchableOpacity>

      {adderModal.inventory.selectedProduct && (
        <Text style={styles.remainingLabel}>
          {adderModal.inventory.remaining[
            adderModal.inventory.selectedProduct.id
          ] ?? 0}{" "}
          left
        </Text>
      )}

      <Modal
        visible={listOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setListOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setListOpen(false)}
        >
          <View style={styles.list}>
            {adderModal.inventory.products.map((product, index) => (
              <TouchableOpacity
                key={product.id}
                style={styles.listRow}
                onPress={() => {
                  adderModal.inventory.setSelectedProduct(product);
                  setListOpen(false);
                }}
                testID={`picker-option-${index}`}
              >
                <Text style={styles.listRowName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.listRowRemaining}>
                  {adderModal.inventory.remaining[product.id] ?? 0} left
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  remainingLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  list: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 8,
    maxHeight: "70%",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  listRowName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F172A" },
  listRowRemaining: { fontSize: 13, fontWeight: "600", color: "#64748B" },
});
