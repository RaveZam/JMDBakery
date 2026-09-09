import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { useEndingInventory } from "../hooks/useEndingInventory";
import { EndingInventoryProductRow } from "../components/ending-inventory-screen-components/EndingInventoryProductRow";

const HEADER_BG = "#0b4c29";

export default function EndingInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { endingInventory } = useEndingInventory();

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Stack.Screen options={{ animation: "none" }} />
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() =>
                router.replace({
                  pathname: "/main/history/[sessionId]",
                  params: {
                    sessionId: endingInventory.sessionId ?? "",
                    routeName: endingInventory.routeName,
                  },
                })
              }
              hitSlop={10}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerLabel}>ENDING INVENTORY</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {endingInventory.routeName || "Session"}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Products</Text>
          <Text style={styles.sectionHint}>
            Count the bad orders and the good stock left on the truck
            separately. EXP is what the system expects.
          </Text>

          {endingInventory.items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="layers-outline" size={22} color="#94A3B8" />
              <Text style={styles.emptyText}>
                No morning inventory logged for this session.
              </Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, styles.colHeadProduct]}>
                  PRODUCT
                </Text>
                <Text style={[styles.colHead, styles.colHeadCount]}>
                  BAD ORDER
                </Text>
                <Text style={[styles.colHead, styles.colHeadCount]}>
                  BALANCE
                </Text>
              </View>
              {endingInventory.items.map((item) => (
                <EndingInventoryProductRow
                  key={item.productId}
                  item={item}
                  onStep={(field, delta) =>
                    endingInventory.updateCount(item.productId, field, delta)
                  }
                  onSet={(field, next) =>
                    endingInventory.setCount(item.productId, field, next)
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              endingInventory.saving && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.7}
            disabled={endingInventory.saving}
            onPress={endingInventory.save}
          >
            <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {endingInventory.saving ? "Saving..." : "Save Ending Inventory"}
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F0EB" },
  container: { flex: 1, backgroundColor: "#F0F0EB" },

  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  backBtn: { marginLeft: -4 },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#86EFAC",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10, paddingBottom: 40 },

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
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },
  sectionHint: { fontSize: 12, color: "#8A8F8B", lineHeight: 16 },

  table: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  colHead: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  colHeadProduct: { flex: 1 },
  colHeadCount: { width: 104, textAlign: "center" },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#0b4c29",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
