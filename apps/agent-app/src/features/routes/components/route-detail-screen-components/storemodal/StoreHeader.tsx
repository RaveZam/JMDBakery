import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreRow } from "../../../types/db-rows";
import { styles } from "./styles";

function formatLocation(store: StoreRow): string {
  return [store.barangay, store.city, store.province]
    .filter(Boolean)
    .join(", ");
}

export function StoreHeader({ store }: { store: StoreRow }) {
  const location = formatLocation(store);
  return (
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <Ionicons name="storefront-outline" size={22} color="#3F7355" />
      </View>
      <View style={styles.headerText}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowTick} />
          <Text style={styles.eyebrow}>STORE</Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {store.name}
        </Text>
        {location ? (
          <Text style={styles.location} numberOfLines={2}>
            {location}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
