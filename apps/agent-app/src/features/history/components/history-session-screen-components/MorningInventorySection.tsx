import { View, Text, StyleSheet } from "react-native";
import { useHistorySession } from "../../hooks/useHistorySession";

export function MorningInventorySection() {
  const { session } = useHistorySession();

  return (
    <>
      <Text style={styles.sectionTitle}>Morning Inventory</Text>
      {session.inventory.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No inventory recorded.</Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHead, styles.colHeadProduct]}>PRODUCT</Text>
            <Text style={[styles.colHead, styles.colHeadQty]}>QTY</Text>
          </View>
          {session.inventory.map((item) => (
            <View key={item.inventoryId} style={styles.row}>
              <Text style={styles.rowProduct} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.rowQty}>{item.qty}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },

  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  colHead: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  colHeadProduct: { flex: 1 },
  colHeadQty: { width: 60, textAlign: "right" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rowProduct: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" },
  rowQty: {
    width: 60,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
});
