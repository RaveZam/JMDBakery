import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { StoreCreditEntryRow } from "@/src/lib/dao/store-credit-dao";
import type { LoggedItem } from "@/src/features/store/types/store-types";
import { sumItemsTotal } from "../../core/session-derived";

type SessionStoreRow = ReturnType<typeof SessionStoresDao.getBySessionId>[number];

type Props = {
  store: SessionStoreRow;
  items: LoggedItem[];
  payments: StoreCreditEntryRow[];
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
        {visited ? "Visited" : "Skipped"}
      </Text>
    </View>
  );
}

function StoreItemsList({ items }: { items: LoggedItem[] }) {
  if (items.length === 0) {
    return <Text style={styles.noItems}>No items logged.</Text>;
  }
  const storeTotal = sumItemsTotal(items);
  return (
    <View style={styles.itemsWrap}>
      {items.map((it) => (
        <View key={it.saleId} style={styles.itemRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {it.productName}
          </Text>
          <Text style={styles.itemQty}>×{it.qty}</Text>
          <Text
            style={[
              styles.itemPayment,
              it.paymentType === "credit"
                ? styles.itemPaymentCredit
                : styles.itemPaymentCash,
            ]}
          >
            {it.paymentType === "credit" ? "Credit" : "Cash"}
          </Text>
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

// What the store paid off its balance on this visit. Separate from the order
// total above it — a payment settles old debt, it is not part of what was sold
// today, so adding the two together would be wrong.
function StorePaymentsList({ payments }: { payments: StoreCreditEntryRow[] }) {
  if (payments.length === 0) return null;
  return (
    <View style={styles.paymentsWrap}>
      {payments.map((payment) => (
        <View key={payment.id} style={styles.paymentRow}>
          <Ionicons name="cash-outline" size={14} color="#0b4c29" />
          <Text style={styles.paymentLabel}>Payment collected</Text>
          <Text style={styles.paymentAmount}>₱{payment.amount.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
}

export function StoreCard({ store, items, payments }: Props) {
  return (
    <View style={styles.storeCard}>
      <StoreCardHeader store={store} />
      <StoreItemsList items={items} />
      <StorePaymentsList payments={payments} />
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
  itemPayment: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemPaymentCash: { color: "#166534", backgroundColor: "#DCFCE7" },
  itemPaymentCredit: { color: "#1D4ED8", backgroundColor: "#DBEAFE" },
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

  paymentsWrap: {
    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  paymentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paymentLabel: { flex: 1, fontSize: 13, color: "#166534" },
  paymentAmount: { fontSize: 14, fontWeight: "700", color: "#0b4c29" },
});
