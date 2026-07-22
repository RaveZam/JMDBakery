import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type SnackbarProps = {
  visible: boolean;
  message: string;
};

export function Snackbar({ visible, message }: SnackbarProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + 16 }]}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0b4c29",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
});
