import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistorySession } from "../../hooks/useHistorySession";

export function EndingInventoryFab() {
  const { session } = useHistorySession();
  if (session.inventory.length === 0) return null;

  return (
    <TouchableOpacity
      style={styles.fab}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/main/routes/ending-inventory",
          params: {
            sessionId: session.sessionId,
            routeName: session.data?.route_name ?? "",
          },
        })
      }
    >
      <Ionicons
        name={
          session.hasEndingInventory ? "checkmark-circle-outline" : "layers-outline"
        }
        size={20}
        color="#FFFFFF"
      />
      <Text style={styles.fabText}>
        {session.hasEndingInventory
          ? "Update Ending Inventory"
          : "Log Ending Inventory"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#0b4c29",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
