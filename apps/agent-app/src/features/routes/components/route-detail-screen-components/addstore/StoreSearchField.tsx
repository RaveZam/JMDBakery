import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import type { StoreSearch } from "./types";

/** Province search box. Seeded with the province name; the agent can widen it. */
export function StoreSearchField({ search }: { search: StoreSearch }) {
  return (
    <View style={styles.searchRow}>
      <TextInput
        value={search.term}
        onChangeText={search.setTerm}
        onSubmitEditing={search.search}
        placeholder="Search by province"
        placeholderTextColor="#94A3B8"
        style={styles.searchInput}
        returnKeyType="search"
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={search.search}
        testID="existing-store-search"
      >
        <Ionicons name="search" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
