import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useCredit } from "../hooks/useCredit";
import { CreditEntryRow } from "./CreditEntryRow";
import { CreditPaymentModal } from "./CreditPaymentModal";

const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

// A store with no credit history has no debt to show, so the section is
// hidden entirely rather than rendering an empty card.
export function StoreCreditSection() {
  const credit = useCredit();

  if (credit.entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>STORE CREDIT</Text>
      <View style={styles.card}>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Outstanding</Text>
            <Text style={styles.balanceValue}>
              ₱{credit.balance.toLocaleString()}
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
        {credit.entries.map((entry) => (
          <CreditEntryRow
            key={entry.id}
            item={entry}
            onPress={credit.modal.openEntry}
          />
        ))}
      </View>
      <CreditPaymentModal credit={credit} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
  },
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
});
