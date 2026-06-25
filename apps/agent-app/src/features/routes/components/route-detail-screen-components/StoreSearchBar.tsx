import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function StoreSearchBar() {
  return (
    <View style={styles.searchInputWrapper}>
      <Ionicons name="search-outline" size={16} color="#94A3B8" />
      <TextInput
        placeholder="Search Store..."
        placeholderTextColor="#94A3B8"
        style={styles.searchInput}
      />
      <View style={styles.filterDivider} />
      <TouchableOpacity activeOpacity={0.7}>
        <Ionicons name="options-outline" size={16} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
  },
  filterDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E2E8F0",
  },
});
