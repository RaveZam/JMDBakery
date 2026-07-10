import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistorySessionContext } from "../../context/HistorySessionContext";
import { buildInventoryComparison } from "../../core/inventory-comparison";

function VarianceCell({ variance }: { variance: number | null }) {
  if (variance === null) {
    return <Text style={styles.cellMuted}>—</Text>;
  }
  if (variance === 0) {
    return <Ionicons name="checkmark" size={14} color="#16A34A" />;
  }
  const sign = variance > 0 ? "+" : "";
  return (
    <Text style={[styles.varianceValue, variance > 0 ? styles.varianceOver : styles.varianceUnder]}>
      {sign}
      {variance}
    </Text>
  );
}

export function InventoryComparisonSection() {
  const session = useHistorySessionContext();
  const rows = useMemo(
    () => buildInventoryComparison(session.inventory, session.endingInventory, session.salesByStore),
    [session.inventory, session.endingInventory, session.salesByStore],
  );

  if (session.inventory.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No inventory recorded.</Text>
      </View>
    );
  }

  return (
    <>
      {session.hasEndingInventory && (
        <View style={styles.sectionHeader}>
          <Text style={styles.hint}>Start → sold → end, matched against expected</Text>
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            hitSlop={8}
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
            <Ionicons name="create-outline" size={14} color="#0b4c29" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHead, styles.colHeadProduct]}>PRODUCT</Text>
          <Text style={[styles.colHead, styles.colHeadNum]}>START</Text>
          <Text style={[styles.colHead, styles.colHeadNum]}>SOLD</Text>
          <Text style={[styles.colHead, styles.colHeadNum]}>END</Text>
          <Text style={[styles.colHead, styles.colHeadVariance]}>VAR</Text>
        </View>
        {rows.map((row) => (
          <View key={row.productId} style={styles.row}>
            <Text style={styles.rowProduct} numberOfLines={1}>
              {row.productName}
            </Text>
            <Text style={styles.cellNum}>{row.start}</Text>
            <Text style={styles.cellNum}>{row.sold}</Text>
            <Text style={styles.cellNum}>{row.end === null ? "—" : row.end}</Text>
            <View style={styles.cellVariance}>
              <VarianceCell variance={row.variance} />
            </View>
          </View>
        ))}
      </View>

      {!session.hasEndingInventory && (
        <Text style={styles.pendingNote}>
          End quantities appear here once ending inventory is logged.
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hint: { flex: 1, fontSize: 12, color: "#94A3B8" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: "#0b4c29" },

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
    paddingHorizontal: 12,
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
  colHeadNum: { width: 42, textAlign: "right" },
  colHeadVariance: { width: 38, textAlign: "right" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rowProduct: { flex: 1, fontSize: 13, fontWeight: "600", color: "#0F172A" },
  cellNum: { width: 42, fontSize: 13, fontWeight: "600", color: "#334155", textAlign: "right" },
  cellVariance: { width: 38, alignItems: "flex-end" },
  cellMuted: { fontSize: 13, color: "#CBD5E1" },
  varianceValue: { fontSize: 13, fontWeight: "700" },
  varianceOver: { color: "#B45309" },
  varianceUnder: { color: "#DC2626" },

  pendingNote: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    paddingHorizontal: 2,
  },
});
