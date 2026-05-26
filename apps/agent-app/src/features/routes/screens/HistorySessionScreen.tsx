import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import RouteSessionsDao from "@/lib/sqlite/dao/route-sessions-dao";
import SessionInventoryDao from "@/lib/sqlite/dao/session-inventory-dao";
import SessionStoresDao from "@/lib/sqlite/dao/session-stores-dao";
import SalesDao from "@/lib/sqlite/dao/sales-dao";
import type { LoggedItem } from "@/src/features/store/hooks/useDistributionLog";

const HEADER_BG = "#0b4c29";

export default function HistorySessionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";

  const session = useMemo(
    () => (sessionId ? RouteSessionsDao.getById(sessionId) : null),
    [sessionId],
  );
  const inventory = useMemo(
    () => (sessionId ? SessionInventoryDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const stores = useMemo(
    () => (sessionId ? SessionStoresDao.getBySessionId(sessionId) : []),
    [sessionId],
  );
  const salesByStore = useMemo(() => {
    const map: Record<string, LoggedItem[]> = {};
    for (const s of stores) map[s.id] = SalesDao.getBySessionStoreId(s.id);
    return map;
  }, [stores]);

  const visitedCount = stores.filter((s) => s.visited === 1).length;
  const formattedDate = session?.session_date
    ? new Date(session.session_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Stack.Screen options={{ animation: "slide_from_right" }} />
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerLabel}>SESSION DETAIL</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {session?.route_name ?? "Session"}
          </Text>
          <Text style={styles.headerSub}>
            {formattedDate}
            {session ? ` • ${visitedCount} of ${stores.length} visited` : ""}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Morning Inventory</Text>
          {inventory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No inventory recorded.</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, styles.colHeadProduct]}>
                  PRODUCT
                </Text>
                <Text style={[styles.colHead, styles.colHeadQty]}>QTY</Text>
              </View>
              {inventory.map((item) => (
                <View key={item.inventoryId} style={styles.row}>
                  <Text style={styles.rowProduct} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.rowQty}>{item.qty}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Stores</Text>
          {stores.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No stores in this session.</Text>
            </View>
          ) : (
            stores.map((s) => {
              const visited = s.visited === 1;
              const items = salesByStore[s.id] ?? [];
              const storeTotal = items.reduce(
                (sum, it) => sum + it.price * it.qty,
                0,
              );
              return (
                <View key={s.id} style={styles.storeCard}>
                  <View style={styles.storeRow}>
                    <Ionicons
                      name={visited ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={visited ? "#16A34A" : "#CBD5E1"}
                    />
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName} numberOfLines={1}>
                        {s.store_name}
                      </Text>
                      {s.province_name ? (
                        <Text style={styles.storeMeta} numberOfLines={1}>
                          {s.province_name}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.storeStatus,
                        visited ? styles.storeStatusDone : null,
                      ]}
                    >
                      {visited ? "Visited" : "Pending"}
                    </Text>
                  </View>

                  {items.length === 0 ? (
                    <Text style={styles.noItems}>No items logged.</Text>
                  ) : (
                    <View style={styles.itemsWrap}>
                      {items.map((it) => (
                        <View key={it.saleId} style={styles.itemRow}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {it.productName}
                          </Text>
                          <Text style={styles.itemQty}>×{it.qty}</Text>
                          {it.boQty > 0 ? (
                            <Text style={styles.itemBo}>{it.boQty} BO</Text>
                          ) : null}
                          <Text style={styles.itemTotal}>
                            ₱{(it.price * it.qty).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.itemTotalRow}>
                        <Text style={styles.itemTotalLabel}>Total</Text>
                        <Text style={styles.itemTotalValue}>
                          ₱{storeTotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
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
  headerSub: { fontSize: 13, color: "#BBF7D0", marginTop: 6 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },

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
  colHeadQty: { width: 60, textAlign: "right" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rowProduct: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" },
  rowQty: {
    width: 60,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },

  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  storeMeta: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  storeStatus: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
  storeStatusDone: { color: "#16A34A" },

  noItems: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  itemsWrap: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FAFAF8",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  itemName: { flex: 1, fontSize: 13, color: "#334155" },
  itemQty: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  itemBo: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
  itemTotal: {
    width: 78,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
  },
  itemTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 4,
    paddingTop: 6,
  },
  itemTotalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemTotalValue: { fontSize: 14, fontWeight: "700", color: "#0b4c29" },
});
