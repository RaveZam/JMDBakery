import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvinceRow } from "../../types/db-rows";
import { useStores } from "../../hooks/useStores";
import { useStoreDetail } from "../../hooks/useStoreDetail";
import { StoreListRow } from "./StoreListRow";
import { AddStoreModal } from "./AddStoreModal";
import { ViewStoreModal } from "./storemodal";

type Props = {
  province: ProvinceRow;
  onEditProvince: (province: ProvinceRow) => void;
};

export function ProvinceCard({ province, onEditProvince }: Props) {
  const { stores, loadStores } = useStores(province.id);
  const { store, openStore, closeStore } = useStoreDetail();
  const [showAddStore, setShowAddStore] = useState(false);

  return (
    <View style={styles.provincePanel} testID={`province-item-${province.id}`}>
      <View style={styles.provinceHeader}>
        <TouchableOpacity
          style={styles.provinceHeaderMain}
          activeOpacity={0.7}
          onPress={() => onEditProvince(province)}
          testID={`province-edit-${province.id}`}
        >
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
          <Ionicons name="ellipsis-horizontal" size={16} color="#CBD5E1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addStoreButton}
          activeOpacity={0.7}
          onPress={() => setShowAddStore(true)}
          testID={`province-add-store-${province.id}`}
          accessibilityLabel="add-store"
        >
          <Ionicons name="add" size={18} color="#3F7355" />
        </TouchableOpacity>
      </View>

      {stores.length === 0 ? (
        <Text style={styles.noStoresText}>No stores added yet</Text>
      ) : (
        <View style={styles.storeList}>
          {stores.map((s, index) => (
            <View key={s.id}>
              {index > 0 && <View style={styles.storeDivider} />}
              <StoreListRow store={s} onPress={openStore} />
            </View>
          ))}
        </View>
      )}

      <AddStoreModal
        provinceId={province.id}
        provinceName={province.name}
        visible={showAddStore}
        onClose={() => setShowAddStore(false)}
        onAdded={() => {
          setShowAddStore(false);
          loadStores();
        }}
      />

      <ViewStoreModal
        store={store}
        onClose={closeStore}
        onChanged={loadStores}
      />
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
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  provinceHeaderMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addStoreButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
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
