import { View, Text, StyleSheet } from "react-native";

export function InventoryEmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>No products loaded yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
