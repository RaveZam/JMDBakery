import { StyleSheet, View, Text } from "react-native";
import { SectionRow } from "./SectionRow";
import { SoldOrderRow } from "./SoldOrderRow";
import type { OrdersSectionProps } from "../types/store-types";

const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

export function OrdersSection({
  items,
  onAddPress,
  onItemPress,
  onDeleteItem,
}: OrdersSectionProps) {
  return (
    <View style={styles.section}>
      <SectionRow
        label="ORDERS"
        buttonLabel="+ Add Order"
        onToggle={onAddPress}
      />
      {items.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHead, styles.colHeadProduct]}>PRODUCT</Text>
            <Text style={[styles.colHead, styles.colHeadSold]}>SOLD</Text>
            <Text style={[styles.colHead, styles.colHeadBo]}>BO</Text>
            <Text style={[styles.colHead, styles.colHeadTotal]}>TOTAL</Text>
            <View style={styles.colHeadDelete} />
          </View>
          {items.map(({ item, idx }) => (
            <SoldOrderRow
              key={idx}
              item={item}
              index={idx}
              onPress={() => onItemPress(idx)}
              onDelete={onDeleteItem}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  table: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
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
  colHeadSold: { width: 72, textAlign: "center" },
  colHeadBo: { width: 64, textAlign: "center" },
  colHeadTotal: { width: 68, textAlign: "right" },
  colHeadDelete: { width: 21 },
  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
