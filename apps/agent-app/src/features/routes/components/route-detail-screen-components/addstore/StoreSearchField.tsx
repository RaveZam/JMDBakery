import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import type { StoreSearch } from "./types";

/** Search box for finding a store by name or province. */
export function StoreSearchField({ search }: { search: StoreSearch }) {
  return (
    <View style={styles.searchRow}>
      <TextInput
        value={search.term}
        onChangeText={search.setTerm}
        onSubmitEditing={search.search}
        placeholder="Search via Store Name or province"
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
