import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import type { VisitFooterProps } from "../types/store-types";

const HEADER_BG = "#0b4c29";
const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

export function VisitFooter({ netTotal, onConfirm }: VisitFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryNetLabel}>Net total</Text>
        <Text style={styles.summaryNetValue}>
          ₱{netTotal.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.confirmBtn}
        activeOpacity={0.8}
        onPress={onConfirm}
      >
        <Text style={styles.confirmBtnText}>Confirm visit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
