import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ProvinceCard } from "./ProvinceCard";
import { useProvinces } from "../../hooks/useProvinces";

type Props = {
  routeId: string;
  onSelectStore: (storeId: string) => void;
};

export function ProvinceList({ routeId, onSelectStore }: Props) {
  const { provinces } = useProvinces(routeId);

  return (
    <View style={styles.content}>
      {provinces.length > 0 && (
        <Text style={styles.sectionLabel}>
          {provinces.length} {provinces.length === 1 ? "province" : "provinces"}{" "}
          available
        </Text>
      )}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {provinces.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>
              No provinces yet.{"\n"}Add one to get started.
            </Text>
          </View>
        ) : (
          provinces.map((province) => (
            <ProvinceCard
              key={province.id}
              province={province}
              onSelectStore={onSelectStore}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 100,
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
