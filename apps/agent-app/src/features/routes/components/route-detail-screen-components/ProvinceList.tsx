import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ProvinceCard } from "./ProvinceCard";
import { ProvinceRow } from "../../types/db-rows";

type Props = {
  provinces: ProvinceRow[];
  onSelectStore: (storeId: string) => void;
  refreshKey?: number;
};

export function ProvinceList({ provinces, onSelectStore, refreshKey }: Props) {
  return (
    <View style={styles.content}>
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
              refreshKey={refreshKey}
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
