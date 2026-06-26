import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvinceRow } from "../../types/db-rows";
import { useStores } from "../../hooks/useStores";
import { StoreListRow } from "./StoreListRow";

type Props = {
  province: ProvinceRow;
  onSelectStore: (storeId: string) => void;
};

export function ProvinceCard({ province, onSelectStore }: Props) {
  const { stores } = useStores(province.id);

  return (
    <View style={styles.provincePanel} testID={`province-item-${province.id}`}>
      <View style={styles.provinceHeader}>
        <View style={styles.provinceIconWrap}>
          <Ionicons name="map-outline" size={16} color="#1b6e40" />
        </View>
        <Text style={styles.provinceName}>{province.name}</Text>
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
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
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
