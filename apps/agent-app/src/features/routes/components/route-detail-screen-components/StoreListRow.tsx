import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Store } from "../../types/db-rows";

type Props = {
  store: Store;
  onPress: (storeId: string) => void;
};

export function StoreListRow({ store, onPress }: Props) {
  const address = [store.barangay, store.city].filter(Boolean).join(", ");

  return (
    <TouchableOpacity
      style={styles.storeRow}
      activeOpacity={0.7}
      onPress={() => onPress(store.id)}
      testID={`store-item-${store.id}`}
    >
      <View style={styles.marker}>
        <Ionicons name="storefront-outline" size={14} color="#5E7E6B" />
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>
          {store.name}
        </Text>
        {address ? (
          <Text style={styles.storeAddress} numberOfLines={1}>
            {address}
          </Text>
        ) : null}
        {!store.isOwn && !!store.created_by_name && (
          <Text style={styles.storeOwner}>From {store.created_by_name}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 11,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F0",
  },
  storeInfo: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1E293B",
  },
  storeAddress: {
    fontSize: 12,
    fontWeight: "300",
    color: "#64748B",
  },
  storeOwner: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B8923F",
  },
});
