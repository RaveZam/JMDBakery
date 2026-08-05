import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useProductQuantity } from "../../context/useProductQuantity";
import { PRESET_REASONS } from "../../types/store-types";

const BORDER = "#E2E8F0";

export function ReasonPicker() {
  const { sales } = useProductQuantity();

  if (sales.adder.form.badOrder.quantity === 0) return null;

  return (
    <View style={styles.reasonSection}>
      <Text style={styles.reasonTitle}>Reason</Text>
      <View style={styles.reasonChips}>
        {PRESET_REASONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.chip,
              sales.adder.form.badOrder.reasonType === r && styles.chipActive,
            ]}
            onPress={() => {
              sales.adder.form.badOrder.selectReason(r);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                sales.adder.form.badOrder.reasonType === r && styles.chipTextActive,
              ]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {sales.adder.form.badOrder.reasonType === "Custom" && (
        <TextInput
          style={styles.customInput}
          placeholder="Describe the reason…"
          placeholderTextColor="#94A3B8"
          value={sales.adder.form.badOrder.reason}
          onChangeText={sales.adder.form.badOrder.setReason}
          autoFocus
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  reasonSection: { gap: 10 },
  reasonTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  reasonChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  chipText: { fontSize: 13, fontWeight: "500", color: "#64748B" },
  chipTextActive: { color: "#F97316", fontWeight: "700" },
  customInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0F172A",
  },
});
