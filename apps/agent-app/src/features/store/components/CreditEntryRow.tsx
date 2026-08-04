import { StyleSheet, Pressable, View, Text } from "react-native";
import type { CreditEntry } from "../types/store-types";

const BORDER = "#E2E8F0";

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// How much of this credit is still owed, once every payment the store has made
// is spread over its debts oldest first. Undefined for a payment row, which is
// what settles debts rather than being one.
function SettlementLabel({
  item,
  remaining,
}: {
  item: CreditEntry;
  remaining?: number;
}) {
  if (remaining === undefined) return null;
  if (remaining <= 0) return <Text style={styles.paid}>Paid</Text>;
  if (remaining < item.amount) {
    return (
      <Text style={styles.partial}>₱{remaining.toLocaleString()} left</Text>
    );
  }
  return <Text style={styles.unpaid}>Unpaid</Text>;
}

type Props = {
  item: CreditEntry;
  remaining?: number;
  onPress: (item: CreditEntry) => void;
};

export function CreditEntryRow({ item, remaining, onPress }: Props) {
  const isCredit = item.entryType === "credit";

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(item)}
    >
      <Text style={styles.date}>{formatShortDate(item.createdAt)}</Text>
      <View style={styles.colType}>
        <View style={styles.typeRow}>
          <Text style={styles.typeLabel}>
            {isCredit ? "Credit" : "Payment"}
          </Text>
          <SettlementLabel item={item} remaining={remaining} />
        </View>
        {item.recordedByName && (
          <Text style={styles.recordedBy} numberOfLines={1}>
            {item.recordedByName}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.amount,
          isCredit ? styles.amountCredit : styles.amountPayment,
        ]}
      >
        {isCredit ? "+" : "-"}₱{item.amount.toLocaleString()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  rowPressed: { backgroundColor: "#F8FAFC" },
  date: { width: 56, fontSize: 12, color: "#94A3B8" },
  colType: { flex: 1, gap: 2 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeLabel: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  paid: { fontSize: 11, fontWeight: "700", color: "#16A34A" },
  partial: { fontSize: 11, fontWeight: "700", color: "#D97706" },
  unpaid: { fontSize: 11, fontWeight: "700", color: "#94A3B8" },
  recordedBy: { fontSize: 11, color: "#94A3B8" },
  amount: { fontSize: 13, fontWeight: "700" },
  amountCredit: { color: "#EF4444" },
  amountPayment: { color: "#16A34A" },
});
