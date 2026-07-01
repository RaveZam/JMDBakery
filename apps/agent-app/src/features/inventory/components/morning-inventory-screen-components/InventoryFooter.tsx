import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HEADER_BG = "#0b4c29";

type Props = {
  onContinue: () => void;
};

export function InventoryFooter({ onContinue }: Props) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.continueBtn}
        activeOpacity={0.85}
        onPress={onContinue}
      >
        <Text style={styles.continueBtnText}>Continue to Route</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: HEADER_BG,
  },
  continueBtnText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
