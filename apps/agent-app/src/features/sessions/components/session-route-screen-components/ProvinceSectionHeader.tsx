import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
};

export function ProvinceSectionHeader({ title }: Props) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name="map-outline" size={12} color="#64748B" />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    flex: 1,
  },
});
