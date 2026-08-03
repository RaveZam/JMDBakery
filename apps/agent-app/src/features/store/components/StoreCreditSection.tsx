import { StyleSheet, View, Text } from "react-native";
import { useStoreCredit } from "../hooks/useStoreCredit";
import { CreditEntryRow } from "./CreditEntryRow";

const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

// A store with no credit history has no debt to show, so the section is
// hidden entirely rather than rendering an empty card.
export function StoreCreditSection() {
  const { entries, balance } = useStoreCredit();

  if (entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>STORE CREDIT</Text>
      <View style={styles.card}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Outstanding</Text>
          <Text style={styles.balanceValue}>
            ₱{balance.toLocaleString()}
          </Text>
        </View>
        {entries.map((entry) => (
          <CreditEntryRow key={entry.id} item={entry} />
        ))}
      </View>
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
  balanceLabel: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  balanceValue: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
});
