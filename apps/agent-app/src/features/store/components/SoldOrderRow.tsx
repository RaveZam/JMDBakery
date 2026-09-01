import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SoldRowProps } from "../types/store-types";

const BORDER = "#E2E8F0";

export function SoldOrderRow({ item, index, onPress, onDelete }: SoldRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      {/* Product */}
      <View style={styles.colProduct}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.productPrice}>₱{item.price} / pack</Text>
        <View style={styles.tagRow}>
          {item.qty > 0 ? (
            <View
              style={[
                styles.payTag,
                item.paymentType === "credit"
                  ? styles.payTagCredit
                  : styles.payTagCash,
              ]}
            >
              <Text
                style={[
                  styles.payTagText,
                  item.paymentType === "credit"
                    ? styles.payTagTextCredit
                    : styles.payTagTextCash,
                ]}
              >
                {item.paymentType === "credit" ? "Credit" : "Cash"}
              </Text>
            </View>
          ) : null}
          {item.boQty > 0 ? (
            <View style={[styles.payTag, styles.payTagBo]}>
              <Text style={[styles.payTagText, styles.payTagTextBo]}>BO</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Sold qty */}
      <View style={styles.colSold}>
        <Text style={styles.soldQty}>{item.qty}</Text>
      </View>

      {/* BO */}
      <View style={styles.colBo}>
        {item.boQty > 0 ? (
          <Text style={styles.boQty}>{item.boQty}</Text>
        ) : (
          <Text style={styles.dash}>—</Text>
        )}
      </View>

      {/* Total */}
      <Text style={styles.colTotal}>₱{(item.qty * item.price).toLocaleString()}</Text>

      {/* Delete */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(index)}
        accessibilityLabel="delete-row"
        hitSlop={8}
      >
        <Ionicons name="close" size={13} color="#CBD5E1" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  colProduct: { flex: 1, marginRight: 8, gap: 2 },
  productName: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
  productPrice: { fontSize: 11, color: "#94A3B8" },

  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  payTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  payTagCash: { backgroundColor: "#ECFDF5" },
  payTagCredit: { backgroundColor: "#FFFBEB" },
  payTagBo: { backgroundColor: "#FEF2F2" },
  payTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  payTagTextCash: { color: "#15803D" },
  payTagTextCredit: { color: "#D97706" },
  payTagTextBo: { color: "#EF4444" },

  colSold: {
    width: 72,
    alignItems: "center",
  },
  soldQty: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  colBo: {
    width: 64,
    alignItems: "center",
  },
  boQty: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  dash: { fontSize: 14, color: "#CBD5E1" },

  colTotal: {
    width: 68,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  deleteBtn: { marginLeft: 8 },
});
