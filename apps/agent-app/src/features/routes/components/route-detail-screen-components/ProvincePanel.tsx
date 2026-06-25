import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvinceRow, StoreRow as StoreRowType } from "../../types/db-rows";
import { StoreRow } from "./StoreRow";
import { useRouteDetail } from "../../context/useRouteDetail";

type Props = {
  province: ProvinceRow;
  stores: StoreRowType[];
};

export function ProvincePanel({ province, stores }: Props) {
  const { isEditing, open } = useRouteDetail();

  return (
    <View style={styles.provincePanel}>
      {/* Province header row */}
      <View style={styles.provinceHeader}>
        <Text style={styles.provinceName}>{province.name}</Text>
        {isEditing && (
          <View style={styles.provinceHeaderActions}>
            <TouchableOpacity
              style={styles.addStoreButton}
              activeOpacity={0.7}
              onPress={() => open({ type: "addStore", province })}
            >
              <Ionicons name="add" size={14} color="#1b6e40" />
              <Text style={styles.addStoreButtonText}>Add Store</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteProvinceButton}
              activeOpacity={0.7}
              onPress={() => open({ type: "deleteProvince", province })}
            >
              <Ionicons name="trash-outline" size={15} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Store list */}
      {stores.length === 0 ? (
        <Text style={styles.noStoresText}>No stores added yet</Text>
      ) : (
        <View style={styles.storeList}>
          {stores.map((store, index) => (
            <View key={store.id}>
              {index > 0 && <View style={styles.storeDivider} />}
              <StoreRow store={store} province={province} />
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
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  provinceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  provinceHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteProvinceButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  addStoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1b6e40",
  },
  addStoreButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1b6e40",
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
