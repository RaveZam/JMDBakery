import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { InventoryComparisonRow as Row } from "../../core/inventory-comparison";

const INK = "#1F2421";
const MUTED = "#6B7280";
const OVER = "#B45309";
const UNDER = "#DC2626";
const DASH = "#C4C8C2";

type Props = {
  row: Row;
  expanded: boolean;
  topDivider: boolean;
  onToggle: () => void;
};

/** Ink for an even count, amber for over, red for short. */
function varianceColor(variance: number | null) {
  if (variance === null || variance === 0) return INK;
  return variance > 0 ? OVER : UNDER;
}

function formatVariance(variance: number) {
  return variance > 0 ? `+${variance}` : String(variance);
}

/**
 * One counted figure in the collapsed row: the number the driver counted,
 * plus a small +/- chip when it differs from what the sales expected.
 * A dash means this product hasn't been counted yet.
 */
function CountedFigure({ value, variance }: { value: number | null; variance: number | null }) {
  if (value === null || variance === null) {
    return <Text style={[styles.countedValue, styles.countedDash]}>—</Text>;
  }
  return (
    <View style={styles.countedFigure}>
      <Text style={[styles.countedValue, { color: varianceColor(variance) }]}>{value}</Text>
      {variance !== 0 && (
        <Text style={[styles.chip, { color: varianceColor(variance) }]}>
          {formatVariance(variance)}
        </Text>
      )}
    </View>
  );
}

/** Expected vs counted for one measure, shown in the expanded panel. */
function ReconcileLine({
  label,
  expected,
  counted,
  variance,
}: {
  label: string;
  expected: number;
  counted: number | null;
  variance: number | null;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {counted === null || variance === null ? (
        <Text style={styles.detailPending}>not counted yet</Text>
      ) : (
        <View style={styles.detailValues}>
          <Text style={styles.detailExpected}>expected {expected}</Text>
          <Text style={styles.detailCounted}>counted {counted}</Text>
          <Text style={[styles.detailVariance, { color: varianceColor(variance) }]}>
            {variance === 0 ? "✓" : formatVariance(variance)}
          </Text>
        </View>
      )}
    </View>
  );
}

/** The arithmetic behind the expected figure, shown once a row is tapped open. */
function RowDetail({ row }: { row: Row }) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Started</Text>
        <Text style={styles.detailPlain}>{row.start}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Sold</Text>
        <Text style={styles.detailPlain}>{row.sold}</Text>
      </View>
      <ReconcileLine
        label="Bad orders"
        expected={row.bo}
        counted={row.endBo}
        variance={row.boVariance}
      />
      <ReconcileLine
        label="Balance"
        expected={row.balance}
        counted={row.endBalance}
        variance={row.balanceVariance}
      />
    </View>
  );
}

export function InventoryComparisonRow({ row, expanded, topDivider, onToggle }: Props) {
  return (
    <View style={[styles.wrap, topDivider && styles.wrapDivider]}>
      <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onToggle} hitSlop={4}>
        <Text style={styles.product} numberOfLines={1}>
          {row.productName}
        </Text>
        <View style={styles.balanceCol}>
          <CountedFigure value={row.endBalance} variance={row.balanceVariance} />
        </View>
        <View style={styles.badOrderCol}>
          <CountedFigure value={row.endBo} variance={row.boVariance} />
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={13}
          color={MUTED}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {expanded && <RowDetail row={row} />}
    </View>
  );
}

const BALANCE_WIDTH = 74;
const BAD_ORDER_WIDTH = 62;
const CHEVRON_WIDTH = 16;

/** Column widths shared with the table header in InventoryComparisonSection. */
export const inventoryColumnWidths = {
  balance: BALANCE_WIDTH,
  badOrder: BAD_ORDER_WIDTH,
  chevron: CHEVRON_WIDTH,
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#FEFDF9" },
  wrapDivider: { borderTopWidth: 1, borderTopColor: "#EFEBDE" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    columnGap: 4,
  },
  product: { flex: 1, fontSize: 13, fontWeight: "600", color: INK },

  balanceCol: { width: BALANCE_WIDTH, alignItems: "flex-end" },
  badOrderCol: { width: BAD_ORDER_WIDTH, alignItems: "flex-end" },

  countedFigure: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  countedValue: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  countedDash: { color: DASH, fontWeight: "500" },
  chip: {
    fontSize: 11,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  chevron: { width: CHEVRON_WIDTH, textAlign: "center" },

  detail: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#FAF7EE",
    rowGap: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 12, fontWeight: "600", color: MUTED },
  detailPlain: { fontSize: 12, color: INK, fontVariant: ["tabular-nums"] },
  detailValues: { flexDirection: "row", alignItems: "center", columnGap: 14 },
  detailExpected: { fontSize: 12, color: MUTED, fontVariant: ["tabular-nums"] },
  detailCounted: {
    fontSize: 12,
    fontWeight: "700",
    color: INK,
    fontVariant: ["tabular-nums"],
  },
  detailVariance: {
    fontSize: 12,
    fontWeight: "800",
    minWidth: 26,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  detailPending: { fontSize: 12, color: "#8A8F8B", fontStyle: "italic" },
});
