import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BORDER = "#E2E8F0";

export function ProductSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.sectionLabel}>Product</Text>
      <TouchableOpacity
        style={styles.productDropdown}
        onPress={() => setSelected((s) => s ?? "Select product")}
        activeOpacity={0.8}
      >
        <View style={styles.productDropdownInner}>
          <Text style={styles.productName} numberOfLines={1}>
            {selected ?? "Select product"}
          </Text>
        </View>
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
  productChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF2F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
