import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onEndRoute: () => void;
};

export function EndRouteFooter({ onEndRoute }: Props) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.endRouteButton}
        activeOpacity={0.7}
        onPress={onEndRoute}
      >
        <Ionicons name="stop-circle-outline" size={17} color="#DC2626" />
        <Text style={styles.endRouteButtonText}>End Route</Text>
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
  endRouteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#991B1B",
  },
  endRouteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
