import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHistorySessionContext } from "../../context/HistorySessionContext";
import { type InventoryComparisonRow as InventoryComparisonRowData } from "../../core/inventory-comparison";
import { useInventoryComparison } from "../../hooks/useInventoryComparison";
import { InventoryComparisonRow, inventoryColumnWidths } from "./InventoryComparisonRow";

const GREEN = "#0b4c29";
const MUTED = "#6B7280";

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

function FilterTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterTab, active && styles.filterTabActive]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** All / Needs attention switch, shown only when there is something to attend to. */
function AttentionFilter({
  attentionCount,
  showOnlyAttention,
  onChange,
}: {
  attentionCount: number;
  showOnlyAttention: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.filterRow}>
      <FilterTab label="All" active={!showOnlyAttention} onPress={() => onChange(false)} />
      <FilterTab
        label={`Needs attention (${attentionCount})`}
        active={showOnlyAttention}
        onPress={() => onChange(true)}
      />
    </View>
  );
}

function ComparisonTable({
  rows,
  isExpanded,
  onToggleRow,
}: {
  rows: InventoryComparisonRowData[];
  isExpanded: (productId: string) => boolean;
  onToggleRow: (productId: string) => void;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.headRow}>
        <Text style={[styles.head, styles.headProduct]}>Product</Text>
        <Text style={[styles.head, { width: inventoryColumnWidths.balance }]}>Balance</Text>
        <Text style={[styles.head, { width: inventoryColumnWidths.badOrder }]}>Bad orders</Text>
        <View style={{ width: inventoryColumnWidths.chevron }} />
      </View>

      {rows.length === 0 ? (
        <Text style={styles.reconciledNote}>Everything reconciled.</Text>
      ) : (
        rows.map((row, index) => (
          <InventoryComparisonRow
            key={row.productId}
            row={row}
            expanded={isExpanded(row.productId)}
            topDivider={index > 0}
            onToggle={() => onToggleRow(row.productId)}
          />
        ))
      )}
    </View>
  );
}

export function InventoryComparisonSection() {
  const session = useHistorySessionContext();
  const { comparison } = useInventoryComparison();

  if (!comparison.hasStock) {
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

      {session.hasEndingInventory && comparison.attentionCount > 0 && (
        <AttentionFilter
          attentionCount={comparison.attentionCount}
          showOnlyAttention={comparison.showOnlyAttention}
          onChange={comparison.setShowOnlyAttention}
        />
      )}

      <ComparisonTable
        rows={comparison.rows}
        isExpanded={comparison.isExpanded}
        onToggleRow={comparison.toggleRow}
      />

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

  filterRow: {
    flexDirection: "row",
    backgroundColor: "#F4F1E8",
    borderRadius: 10,
    padding: 3,
    columnGap: 3,
  },
  filterTab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center" },
  filterTabActive: {
    backgroundColor: "#FEFDF9",
    borderWidth: 1,
    borderColor: "#E6E3D8",
  },
  filterTabText: { fontSize: 12, fontWeight: "700", color: MUTED },
  filterTabTextActive: { color: GREEN },

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
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN,
    columnGap: 4,
  },
  head: { fontSize: 11, fontWeight: "700", color: GREEN, textAlign: "right" },
  headProduct: { flex: 1, textAlign: "left" },

  reconciledNote: {
    fontSize: 13,
    color: "#8A8F8B",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  pendingNote: {
    fontSize: 12,
    color: "#8A8F8B",
    fontStyle: "italic",
    paddingHorizontal: 2,
    lineHeight: 16,
  },
});
