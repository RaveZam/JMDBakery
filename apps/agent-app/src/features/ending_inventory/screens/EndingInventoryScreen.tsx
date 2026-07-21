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
                <Text style={[styles.colHead, styles.colHeadExpected]}>
                  EXPECTED
                </Text>
                <Text style={[styles.colHead, styles.colHeadQty]}>QTY</Text>
              </View>
              {endingInventory.items.map((item) => (
                <View key={item.productId} style={styles.row}>
                  <Text style={styles.rowProduct} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.rowExpected}>{item.expected}</Text>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      testID={`ending-inventory-decrement-${item.productId}`}
                      onPress={() =>
                        endingInventory.updateQty(item.productId, -1)
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={20}
                        color="#0b4c29"
                      />
                    </TouchableOpacity>
                    <Text style={styles.rowQty}>{item.quantity}</Text>
                    <TouchableOpacity
                      testID={`ending-inventory-increment-${item.productId}`}
                      onPress={() =>
                        endingInventory.updateQty(item.productId, 1)
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#0b4c29"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
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
  colHeadExpected: { width: 70, textAlign: "right" },
  colHeadQty: { width: 90, textAlign: "right" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rowProduct: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" },
  rowExpected: {
    width: 70,
    fontSize: 13,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "right",
  },
  qtyControls: {
    width: 90,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  rowQty: {
    minWidth: 20,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },

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
