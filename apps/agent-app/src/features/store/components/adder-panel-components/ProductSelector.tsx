import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "../../types/store-types";

const BORDER = "#E2E8F0";

export function ProductSelector({
  selected,
  showPrice,
  remaining,
  onPress,
}: {
  selected: Product | undefined;
  showPrice: boolean;
  remaining: number | undefined;
  onPress: () => void;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>Product</Text>
      <TouchableOpacity
        style={styles.productDropdown}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.productDropdownInner}>
          <Text style={styles.productName} numberOfLines={1}>
            {selected?.name ?? "Select product"}
          </Text>
          {selected && showPrice && (
            <Text style={styles.productPrice}>₱{selected.price} / pack</Text>
          )}
        </View>
        {remaining !== undefined && (
          <View
            style={[
              styles.remainingBadge,
              remaining <= 0 && styles.remainingBadgeEmpty,
            ]}
          >
            <Text
              style={[
                styles.remainingText,
                remaining <= 0 && styles.remainingTextEmpty,
              ]}
            >
              {remaining} left
            </Text>
          </View>
        )}
        <View style={styles.productChevron}>
          <Ionicons name="chevron-down" size={16} color="#64748B" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  productDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  productDropdownInner: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  productPrice: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  productChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF2F5",
    alignItems: "center",
    justifyContent: "center",
  },
  remainingBadge: {
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  remainingBadgeEmpty: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  remainingText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
  remainingTextEmpty: { color: "#DC2626" },
});
