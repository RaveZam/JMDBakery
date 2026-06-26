import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { Route } from "../../types/routes-type";
import { useRouter } from "expo-router";

type Props = {
  route: Route;
  onRequestDelete: (route: Route) => void;
};

export function RouteCard({ route, onRequestDelete }: Props) {
  const router = useRouter();
  return (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteAction}
          activeOpacity={0.8}
          onPress={() => onRequestDelete(route)}
        >
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      )}
      rightThreshold={60}
      overshootRight={false}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.routeCard}
        onPress={() =>
          router.push({
            pathname: "/main/routes/detail",
            params: { routeId: route.id, routeName: route.name },
          })
        }
        testID={`route-item-${route.id}`}
      >
        <View style={styles.routeIconWrap}>
          <Ionicons name="location-outline" size={18} color="#1b6e40" />
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{route.name}</Text>
          <Text style={styles.routeSubtitle}>Tap to view stores</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  routeSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
    marginLeft: 8,
    gap: 4,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});
