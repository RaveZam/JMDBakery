import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProvincePanel } from "./ProvincePanel";
import { useRouteDetail } from "../../context/useRouteDetail";

export function ProvinceList() {
  const { provinces, storesByProvince } = useRouteDetail();

  return (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {provinces.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={32} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>
            No provinces yet.{"\n"}Add one below to get started.
          </Text>
        </View>
      )}

      {provinces.map((province) => (
        <ProvincePanel
          key={province.id}
          province={province}
          stores={storesByProvince[province.id] ?? []}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 22,
  },
});
