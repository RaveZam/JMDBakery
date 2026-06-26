import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreRow } from "../../types/db-rows";

type Props = {
  store: StoreRow;
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
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        {address ? <Text style={styles.storeAddress}>{address}</Text> : null}
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
});
