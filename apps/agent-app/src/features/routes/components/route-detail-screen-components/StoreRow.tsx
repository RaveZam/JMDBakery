import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { ProvinceRow, StoreRow as StoreRowType } from "../../types/db-rows";
import { useRouteDetail } from "../../context/useRouteDetail";

type Props = {
  store: StoreRowType;
  province: ProvinceRow;
};

export function StoreRow({ store, province }: Props) {
  const { isEditing, swipeableRefs, open } = useRouteDetail();

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    });
    return (
      <Animated.View style={[styles.deleteAction, { opacity }]}>
        <TouchableOpacity
          style={styles.deleteActionInner}
          activeOpacity={0.8}
          onPress={() => open({ type: "deleteStore", store })}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[store.id] = ref;
      }}
      enabled={isEditing}
      renderRightActions={isEditing ? renderRightActions : undefined}
      rightThreshold={60}
      overshootRight={false}
    >
      <TouchableOpacity
        style={styles.storeRow}
        activeOpacity={0.7}
        onPress={() => {
          if (isEditing) {
            open({ type: "editStore", store, province });
          } else {
            open({ type: "viewStore", store });
          }
        }}
      >
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.barangay || store.city ? (
            <Text style={styles.storeAddress}>
              {[store.barangay, store.city].filter(Boolean).join(", ")}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  storeInfo: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  storeAddress: {
    fontSize: 12,
    color: "#64748B",
  },
  deleteAction: {
    width: 72,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionInner: {
    flex: 1,
    width: "100%",
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});
