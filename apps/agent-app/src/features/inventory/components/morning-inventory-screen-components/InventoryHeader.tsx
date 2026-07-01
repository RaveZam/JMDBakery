import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useInventoryRoute } from "../../hooks/useInventoryRoute";

const HEADER_BG = "#0b4c29";

export function InventoryHeader() {
  const insets = useSafeAreaInsets();
  const { routeName } = useInventoryRoute();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.headerLabel}>MORNING INVENTORY</Text>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {routeName}
      </Text>
      <Text style={styles.headerSub}>
        Record the stock you loaded for today.
      </Text>
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
});
