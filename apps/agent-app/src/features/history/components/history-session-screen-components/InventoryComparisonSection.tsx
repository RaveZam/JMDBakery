import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistorySessionContext } from "../../context/HistorySessionContext";
import {
  buildInventoryComparison,
  type InventoryComparisonRow,
} from "../../core/inventory-comparison";

const GREEN = "#0b4c29";
const INK = "#1F2421";
const MUTED = "#6B7280";

function VarianceCell({ variance }: { variance: number | null }) {
  if (variance === null) {
    return <Text style={styles.cellDash}>—</Text>;
  }
  if (variance === 0) {
    return <Ionicons name="checkmark" size={14} color={GREEN} />;
  }
  const sign = variance > 0 ? "+" : "";
  return (
    <Text style={[styles.varianceValue, variance > 0 ? styles.varianceOver : styles.varianceUnder]}>
      {sign}
      {variance}
    </Text>
  );
}

function SectionHint({ sessionId, routeName }: { sessionId: string; routeName: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.hint}>What should be left, against what you counted.</Text>
      <TouchableOpacity
        style={styles.editBtn}
        activeOpacity={0.7}
        hitSlop={8}
        onPress={() =>
          router.push({
            pathname: "/main/history/ending-inventory",
            params: { sessionId, routeName },
          })
        }
      >
        <Ionicons name="create-outline" size={14} color={GREEN} />
        <Text style={styles.editBtnText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

function ComparisonTable({ rows }: { rows: InventoryComparisonRow[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.headRow}>
        <Text style={[styles.head, styles.colProduct]}>Product</Text>
        <Text style={[styles.head, styles.colWide]}>Start</Text>
        <Text style={[styles.head, styles.colNum]}>Sold</Text>
        <Text style={[styles.head, styles.colWide, styles.headBal]}>Bal</Text>
        <Text style={[styles.head, styles.colNum]}>BO</Text>
        <Text style={[styles.head, styles.colNum]}>End</Text>
        <Text style={[styles.head, styles.colVar]}>VAR</Text>
      </View>
      {rows.map((row, index) => (
        <View key={row.productId} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
          <Text style={styles.cellProduct} numberOfLines={1}>
            {row.productName}
          </Text>
          <Text style={[styles.cellNum, styles.colWide, styles.cellInk]}>{row.start}</Text>
          <Text style={[styles.cellNum, styles.cellMutedNum]}>{row.sold}</Text>
          {/* Balance = good stock that should be left: remaining minus BO units. */}
          <Text style={[styles.cellNum, styles.colWide, styles.cellBal]}>{row.balance}</Text>
          <Text style={[styles.cellNum, styles.cellMutedNum]}>{row.bo}</Text>
          <Text style={[styles.cellNum, styles.cellInk]}>{row.end === null ? "—" : row.end}</Text>
          <View style={styles.cellVar}>
            <VarianceCell variance={row.variance} />
          </View>
        </View>
      ))}
    </View>
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
        <Text style={styles.emptyText}>No stock loaded for this route.</Text>
      </View>
    );
  }

  return (
    <>
      {session.hasEndingInventory && (
        <SectionHint sessionId={session.sessionId} routeName={session.data?.route_name ?? ""} />
      )}

      <ComparisonTable rows={rows} />

      {!session.hasEndingInventory && (
        <Text style={styles.pendingNote}>End counts appear here once you log ending inventory.</Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  hint: { flex: 1, fontSize: 12, color: "#8A8F8B", lineHeight: 16 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: GREEN },

  emptyCard: {
    backgroundColor: "#FEFDF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E3D8",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#8A8F8B" },

  table: {
    backgroundColor: "#FEFDF9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E3D8",
    overflow: "hidden",
  },

  headRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F1E8",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN,
    columnGap: 3,
  },
  head: { fontSize: 11, fontWeight: "700", color: GREEN, letterSpacing: 0.2 },
  headBal: { fontWeight: "800" },
  colProduct: { flex: 1 },
  colNum: { width: 30, textAlign: "right" },
  colWide: { width: 36, textAlign: "right" },
  colVar: {
    width: 34,
    textAlign: "right",
    borderLeftWidth: 1,
    borderLeftColor: "#0b4c2926",
    paddingLeft: 6,
    marginLeft: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    columnGap: 3,
  },
  rowAlt: { backgroundColor: "#FAF7EE" },

  cellProduct: { flex: 1, fontSize: 13, fontWeight: "600", color: INK },
  cellNum: {
    width: 30,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  cellInk: { color: INK },
  cellBal: { color: GREEN, fontWeight: "800" },
  cellMutedNum: { color: MUTED, fontWeight: "500" },
  cellVar: {
    width: 34,
    alignItems: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: "#0b4c2926",
    paddingLeft: 6,
    marginLeft: 3,
  },

  cellDash: { fontSize: 12, color: "#C4C8C2" },
  varianceValue: { fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  varianceOver: { color: "#B45309" },
  varianceUnder: { color: "#DC2626" },

  pendingNote: {
    fontSize: 12,
    color: "#8A8F8B",
    fontStyle: "italic",
    paddingHorizontal: 2,
    lineHeight: 16,
  },
});
