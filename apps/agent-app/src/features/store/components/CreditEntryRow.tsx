import { StyleSheet, Pressable, View, Text } from "react-native";
import type { CreditEntry } from "../types/store-types";

const BORDER = "#E2E8F0";

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type Props = {
  item: CreditEntry;
  onPress: (item: CreditEntry) => void;
};

export function CreditEntryRow({ item, onPress }: Props) {
  const isCredit = item.entryType === "credit";

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(item)}
    >
      <Text style={styles.date}>{formatShortDate(item.createdAt)}</Text>
      <View style={styles.colType}>
        <Text style={styles.typeLabel}>{isCredit ? "Credit" : "Payment"}</Text>
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
  typeLabel: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  recordedBy: { fontSize: 11, color: "#94A3B8" },
  amount: { fontSize: 13, fontWeight: "700" },
  amountCredit: { color: "#EF4444" },
  amountPayment: { color: "#16A34A" },
});
