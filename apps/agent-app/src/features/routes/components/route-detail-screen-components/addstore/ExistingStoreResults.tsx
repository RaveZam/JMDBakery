import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/shared/constants/Colors";
import { ExistingStoreRow } from "./ExistingStoreRow";
import { styles } from "./styles";
import type { AddStoreHandler, StoreSearch } from "./types";

type Props = {
  search: StoreSearch;
  onAdd: AddStoreHandler;
};

/** Owns its own scrolling — the result list is the only part that can overflow. */
export function ExistingStoreResults({ search, onAdd }: Props) {
  return (
    <ScrollView
      style={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ResultState search={search} onAdd={onAdd} />
    </ScrollView>
  );
}

function ResultState({ search, onAdd }: Props) {
  if (search.isSearching) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  if (search.error) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="cloud-offline-outline" size={22} color="#94A3B8" />
        <Text style={styles.placeholderText}>{search.error}</Text>
      </View>
    );
  }

  if (search.results.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          No stores found for “{search.term}”.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {search.results.map((store) => (
        <ExistingStoreRow key={store.id} store={store} onAdd={onAdd} />
      ))}
    </View>
  );
}
