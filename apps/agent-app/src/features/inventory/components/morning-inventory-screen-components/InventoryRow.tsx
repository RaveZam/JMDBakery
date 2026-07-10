import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";
import { useMorningInventory } from "../../context/useMorningInventory";

type Props = {
  item: InventoryItem;
  onEdit: () => void;
};

export function InventoryRow({ item, onEdit }: Props) {
  const { inventory } = useMorningInventory();
  return (
    <TouchableOpacity onPress={onEdit} style={styles.row} activeOpacity={0.7}>
      <Text style={styles.rowProduct} numberOfLines={1}>
        {item.productName}
      </Text>
      <View style={styles.qtyControls}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => inventory.adjustItemQty(item.productId, -1)}
          activeOpacity={0.7}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.qty}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => inventory.adjustItemQty(item.productId, 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => inventory.removeItem(item.productId)}
        hitSlop={8}
        accessibilityLabel="remove-item"
      >
        <Ionicons name="trash-outline" size={16} color="#DC2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 8,
  },
  rowProduct: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" },
  qtyControls: {
    width: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, color: "#475569", lineHeight: 22 },
  qtyValue: {
    minWidth: 28,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  deleteBtn: { width: 24, alignItems: "center" },
});
