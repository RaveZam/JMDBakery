import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useInventoryRoute } from "../../hooks/useInventoryRoute";
import { useMorningInventory } from "../../context/useMorningInventory";
import { PulsingDot } from "@/src/shared/components/PulsingDot";

const HEADER_BG = "#0b4c29";

export function InventoryHeader() {
  const insets = useSafeAreaInsets();
  const { routeName } = useInventoryRoute();
  const { inventory } = useMorningInventory();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.headerLabel}>MORNING INVENTORY</Text>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {routeName}
      </Text>
      <Text style={styles.headerSub}>
        Record the stock you loaded for today.
      </Text>
      <View style={styles.statusRow}>
        <Text style={[styles.headerSub, styles.statusText]}>
          Pending verification:{" "}
          {inventory.pendingVerification
            ? inventory.pendingVerification
            : "Not yet requested"}
        </Text>
        {inventory.pendingVerification === "pending" && (
          <PulsingDot color="#4ADE80" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#86EFAC",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 13, color: "#BBF7D0", marginTop: 6 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  statusText: { marginTop: 0 },
});
