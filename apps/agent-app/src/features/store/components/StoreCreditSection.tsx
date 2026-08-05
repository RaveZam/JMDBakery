import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import type { CreditController } from "../hooks/useCredit";
import { CreditEntryRow } from "./CreditEntryRow";
import { CreditPaymentModal } from "./CreditPaymentModal";

const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

// A negative balance means the store has paid past what it owed, so the label
// flips rather than showing a minus sign the agent has to interpret.
function BalanceRow({ credit }: { credit: CreditController }) {
  return (
    <View style={styles.balanceRow}>
      <View>
        <Text style={styles.balanceLabel}>
          {credit.balance < 0 ? "Credit on account" : "Outstanding"}
        </Text>
        <Text style={styles.balanceValue}>
          ₱{Math.abs(credit.balance).toLocaleString()}
        </Text>
      </View>
      {credit.balance > 0 && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={credit.modal.openPayment}
        >
          <Text style={styles.payButtonText}>Record payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function StoreCreditSection({ credit }: { credit: CreditController }) {
  return (
    <View style={styles.section}>
      {credit.entries.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No credit history yet.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <BalanceRow credit={credit} />
          {credit.entries.map((entry) => (
            <CreditEntryRow
              key={entry.id}
              item={entry}
              remaining={credit.remainingByEntryId[entry.id]}
              onPress={credit.modal.openEntry}
            />
          ))}
        </View>
      )}
      <CreditPaymentModal credit={credit} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F5F5F0",
  },
  balanceLabel: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  balanceValue: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  payButton: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#0b4c29",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
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
