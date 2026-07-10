import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { LoggedItem } from "@/src/features/store/types/store-types";

type SessionStoreRow = ReturnType<typeof SessionStoresDao.getBySessionId>[number];

type Props = {
  store: SessionStoreRow;
  items: LoggedItem[];
};

function StoreCardHeader({ store }: { store: SessionStoreRow }) {
  const visited = store.visited === 1;
  return (
    <View style={styles.storeRow}>
      <Ionicons
        name={visited ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={visited ? "#16A34A" : "#CBD5E1"}
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>
          {store.store_name}
        </Text>
        {store.province_name ? (
          <Text style={styles.storeMeta} numberOfLines={1}>
            {store.province_name}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.storeStatus, visited ? styles.storeStatusDone : null]}>
        {visited ? "Visited" : "Pending"}
      </Text>
    </View>
  );
}

function StoreItemsList({ items }: { items: LoggedItem[] }) {
  if (items.length === 0) {
    return <Text style={styles.noItems}>No items logged.</Text>;
  }
  const storeTotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  return (
    <View style={styles.itemsWrap}>
      {items.map((it) => (
        <View key={it.saleId} style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {it.productName}
          </Text>
          <Text style={styles.itemQty}>×{it.qty}</Text>
          {it.boQty > 0 ? <Text style={styles.itemBo}>{it.boQty} BO</Text> : null}
          <Text style={styles.itemTotal}>₱{(it.price * it.qty).toFixed(2)}</Text>
        </View>
      ))}
      <View style={styles.itemTotalRow}>
        <Text style={styles.itemTotalLabel}>Total</Text>
        <Text style={styles.itemTotalValue}>₱{storeTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

export function StoreCard({ store, items }: Props) {
  return (
    <View style={styles.storeCard}>
      <StoreCardHeader store={store} />
      <StoreItemsList items={items} />
    </View>
  );
}

const styles = StyleSheet.create({
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  storeMeta: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  storeStatus: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
  storeStatusDone: { color: "#16A34A" },

  noItems: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  itemsWrap: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  itemName: { flex: 1, fontSize: 13, color: "#334155" },
  itemQty: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  itemBo: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemTotal: {
    width: 78,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
  },
  itemTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 4,
    paddingTop: 6,
  },
  itemTotalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemTotalValue: { fontSize: 14, fontWeight: "700", color: "#0b4c29" },
});
