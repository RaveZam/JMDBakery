import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRouteDetail } from "../../context/useRouteDetail";

export function StartRouteBar() {
  const { isEditing, routeName, createSession, routeId, open } =
    useRouteDetail();

  return (
    <View style={styles.startRouteBar}>
      {isEditing && (
        <TouchableOpacity
          style={styles.addProvinceButton}
          activeOpacity={0.8}
          onPress={() => open({ type: "addProvince" })}
        >
          <Ionicons name="location-outline" size={18} color="#1b6e40" />
          <Text style={styles.addProvinceButtonText}>
            Add Province/Municipality
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.startRouteButton}
        activeOpacity={0.85}
        onPress={async () => {
          const newSessionId = await createSession();
          router.push({
            pathname: "/main/routes/inventory",
            params: { routeId, routeName, sessionId: newSessionId },
          });
        }}
      >
        <LinearGradient
          colors={["#1b6e40", "#0b4c29"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startRouteButtonGradient}
        >
          <Ionicons name="navigate" size={22} color="#FFFFFF" />
          <Text style={styles.startRouteButtonText}>Start Route</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  startRouteBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  addProvinceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1b6e40",
    backgroundColor: "#FFFFFF",
  },
  addProvinceButtonText: {
    color: "#1b6e40",
    fontSize: 15,
    fontWeight: "600",
  },
  startRouteButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  startRouteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  startRouteButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
