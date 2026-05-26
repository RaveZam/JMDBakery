import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStorePage } from "./hooks/useStorePage";
import { AdderModal } from "./components/AdderModal";
import { SoldOrderRow } from "./components/SoldOrderRow";
import { SectionRow } from "./components/SectionRow";

const HEADER_BG = "#0b4c29";
const BODY_BG = "#F0F0EB";
const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

export default function StorePage() {
  const insets = useSafeAreaInsets();
  const {
    storeName,
    location,
    products,
    loggedItems,
    logItem,
    removeItem,
    editItem,
    soldItems,
    summary,
    remainingByProduct,
    showSoldAdder,
    setShowSoldAdder,
    confirmVisit,
  } = useStorePage();

  const [editIndex, setEditIndex] = useState<number | null>(null);

  const modalVisible = showSoldAdder || editIndex !== null;
  
  const editData =
    editIndex !== null
      ? {
          productId: loggedItems[editIndex].productId,
          qty: loggedItems[editIndex].qty,
          boQty: loggedItems[editIndex].boQty,
          boReason: loggedItems[editIndex].boReason,
        }
      : undefined;

  if (!storeName) return null;

  const { netTotal } = summary;

  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingTop: insets.top }]}
      edges={["left", "right", "bottom"]}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 12 : 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerStoreName} numberOfLines={1}>
              {storeName}
            </Text>
            {!!location && (
              <Text style={styles.headerLocation} numberOfLines={1}>
                {location}
              </Text>
            )}
          </View>
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>In progress</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Orders ── */}
        <View style={styles.section}>
          <SectionRow
            label="ORDERS"
            buttonLabel="+ Add Order"
            onToggle={() => setShowSoldAdder(true)}
          />
          {soldItems.length > 0 ? (
            <View style={styles.table}>
              {/* Column headers */}
              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, styles.colHeadProduct]}>
                  PRODUCT
                </Text>
                <Text style={[styles.colHead, styles.colHeadSold]}>SOLD</Text>
                <Text style={[styles.colHead, styles.colHeadBo]}>BO</Text>
                <Text style={[styles.colHead, styles.colHeadTotal]}>TOTAL</Text>
                <View style={styles.colHeadDelete} />
              </View>
              {soldItems.map(({ item, idx }) => (
                <SoldOrderRow
                  key={idx}
                  item={item}
                  index={idx}
                  onPress={() => setEditIndex(idx)}
                  onDelete={removeItem}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No orders yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Modal (add + edit) ── */}
      <AdderModal
        key={editIndex !== null ? `edit-${editIndex}` : "add"}
        visible={modalVisible}
        title={editIndex !== null ? "Edit Order" : "Add Order"}
        products={products}
        showPrice
        editData={editData}
        remainingByProduct={remainingByProduct}
        onAdd={(productId, qty, boQty, boReason) => {
          if (editIndex !== null) {
            editItem(editIndex, productId, qty, boQty, boReason);
            setEditIndex(null);
          } else {
            logItem(productId, qty, boQty, boReason);
            setShowSoldAdder(false);
          }
        }}
        onClose={() => {
          setShowSoldAdder(false);
          setEditIndex(null);
        }}
      />

      {/* ── Sticky footer: summary + confirm ── */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryNetLabel}>Net total</Text>
          <Text style={styles.summaryNetValue}>
            ₱{netTotal.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={confirmVisit}>
          <Text style={styles.confirmBtnText}>Confirm visit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: HEADER_BG },

  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerStoreName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  headerLocation: { fontSize: 12, color: "#86EFAC", marginTop: 2 },
  inProgressBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.4)",
    backgroundColor: "rgba(74,222,128,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inProgressText: { fontSize: 11, fontWeight: "600", color: "#4ADE80" },

  scroll: { flex: 1, backgroundColor: BODY_BG },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 16 },

  section: { gap: 8 },

  table: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
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
  colHeadSold: { width: 72, textAlign: "center" },
  colHeadBo: { width: 64, textAlign: "center" },
  colHeadTotal: { width: 68, textAlign: "right" },
  colHeadDelete: { width: 21 },

  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },

  footer: {
    backgroundColor: CARD_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryNetLabel: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  summaryNetValue: { fontSize: 15, fontWeight: "700", color: "#0F172A" },

  confirmBtn: {
    backgroundColor: HEADER_BG,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
