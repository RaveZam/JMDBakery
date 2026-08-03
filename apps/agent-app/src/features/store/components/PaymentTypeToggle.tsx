import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const HEADER_BG = "#0b4c29";

type PaymentTypeToggleProps = {
  value: "cash" | "credit";
  onChange: (value: "cash" | "credit") => void;
};

export function PaymentTypeToggle({ value, onChange }: PaymentTypeToggleProps) {
  return (
    <View style={styles.paymentToggle}>
      {(["cash", "credit"] as const).map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.paymentOption,
            value === option && styles.paymentOptionActive,
          ]}
          activeOpacity={0.8}
          onPress={() => onChange(option)}
        >
          <Text
            style={[
              styles.paymentOptionText,
              value === option && styles.paymentOptionTextActive,
            ]}
          >
            {option === "cash" ? "Cash" : "Credit"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paymentToggle: {
    flexDirection: "row",
    backgroundColor: "#F0F0EB",
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  paymentOption: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  paymentOptionActive: { backgroundColor: HEADER_BG },
  paymentOptionText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  paymentOptionTextActive: { color: "#FFFFFF" },
});
