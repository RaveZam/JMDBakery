import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import type { AddStoreHandler } from "./types";
import type { ExistingStore } from "../../../services/store-search-service";

type Props = {
  store: ExistingStore;
  onAdd: AddStoreHandler;
};

/** One search hit, labelled with the agent who registered it. */
export function ExistingStoreRow({ store, onAdd }: Props) {
  const address = [store.barangay, store.city, store.province]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.resultRow} testID={`existing-store-${store.id}`}>
      <View style={styles.resultText}>
        <Text style={styles.resultName} numberOfLines={1}>
          {store.name}
        </Text>
        {!!address && (
          <Text style={styles.resultAddress} numberOfLines={1}>
            {address}
          </Text>
        )}
        {!!store.createdByName && (
          <Text style={styles.resultOwner}>From {store.createdByName}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAdd(store)}
        accessibilityLabel={`add-${store.name}`}
      >
        <Ionicons name="add" size={18} color="#3F7355" />
      </TouchableOpacity>
    </View>
  );
}
