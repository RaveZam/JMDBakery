import { StyleSheet, Text, TouchableOpacity } from "react-native";

const HEADER_BG = "#0b4c29";

export function AddButton() {
  return (
    <TouchableOpacity
      style={styles.addBtn}
      activeOpacity={0.85}
      onPress={() => {}}
    >
      <Text style={styles.addBtnText}>Add to Order</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: HEADER_BG,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    gap: 3,
  },
  addBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
