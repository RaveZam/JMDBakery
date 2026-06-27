import { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvinceRow } from "../../types/db-rows";
import { useStores } from "../../hooks/useStores";
import { StoreListRow } from "./StoreListRow";

type Props = {
  province: ProvinceRow;
  onSelectStore: (storeId: string) => void;
  refreshKey?: number;
};

export function ProvinceCard({ province, onSelectStore, refreshKey }: Props) {
  const { stores, loadStores } = useStores(province.id);

  // Reload when the screen signals a store changed (the hook already loads on mount).
  useEffect(() => {
    if (refreshKey) loadStores();
  }, [refreshKey, loadStores]);

  return (
    <View style={styles.provincePanel} testID={`province-item-${province.id}`}>
      <View style={styles.provinceHeader}>
        <View style={styles.provinceIconWrap}>
          <Ionicons name="map-outline" size={15} color="#3F7355" />
        </View>
        <Text style={styles.provinceName} numberOfLines={1}>
          {province.name}
        </Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{stores.length}</Text>
          <Text style={styles.countBadgeLabel}>
            {stores.length === 1 ? "store" : "stores"}
          </Text>
        </View>
      </View>

      {stores.length === 0 ? (
        <Text style={styles.noStoresText}>No stores added yet</Text>
      ) : (
        <View style={styles.storeList}>
          {stores.map((store, index) => (
            <View key={store.id}>
              {index > 0 && <View style={styles.storeDivider} />}
              <StoreListRow store={store} onPress={onSelectStore} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  provincePanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  provinceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  provinceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  provinceName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F6EEDD",
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9A6B12",
  },
  countBadgeLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#B8923F",
  },
  noStoresText: {
    fontSize: 13,
    color: "#94A3B8",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  storeList: {
    paddingHorizontal: 14,
  },
  storeDivider: {
    height: 1,
    backgroundColor: "#F0F0EB",
  },
});
