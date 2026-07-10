import { View, Text, StyleSheet } from "react-native";
import { useHistorySession } from "../../hooks/useHistorySession";
import { StoreCard } from "./StoreCard";

export function StoresSection() {
  const { session } = useHistorySession();

  return (
    <>
      <Text style={styles.sectionTitle}>Stores</Text>
      {session.stores.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No stores in this session.</Text>
        </View>
      ) : (
        session.stores.map((s) => (
          <StoreCard
            key={s.id}
            store={s}
            items={session.salesByStore[s.id] ?? []}
          />
        ))
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
});
