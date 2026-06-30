import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SessionStore } from "../../hooks/useSessionRoute";

type Props = {
  store: SessionStore;
  index: number;
  onPress: () => void;
};

export function SessionStoreItem({ store, index, onPress }: Props) {
  const visited = store.visited === 1;
  return (
    <TouchableOpacity
      style={[
        styles.storeCard,
        visited ? styles.storeCardVisited : styles.storeCardPending,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {visited ? (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
        </View>
      ) : (
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
      )}
      <View style={styles.storeInfo}>
        <Text
          style={[styles.storeName, visited && styles.storeNameVisited]}
          numberOfLines={1}
        >
          {store.store_name}
        </Text>
        {store.store_barangay ||
        store.store_city ||
        store.store_contact_name ? (
          <View style={styles.storeMeta}>
            {store.store_barangay || store.store_city ? (
              <View style={styles.storeMetaRow}>
                <Ionicons
                  name="location-outline"
                  size={11}
                  color={visited ? "#4ADE80" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.storeMetaText,
                    visited && styles.storeMetaTextVisited,
                  ]}
                  numberOfLines={1}
                >
                  {[store.store_barangay, store.store_city]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            ) : null}
            {store.store_contact_name ? (
              <View style={styles.storeMetaRow}>
                <Ionicons
                  name="person-outline"
                  size={11}
                  color={visited ? "#4ADE80" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.storeMetaText,
                    visited && styles.storeMetaTextVisited,
                  ]}
                  numberOfLines={1}
                >
                  {store.store_contact_name}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.statusBadge,
          visited ? styles.statusBadgeVisited : styles.statusBadgePending,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            visited ? styles.statusTextVisited : styles.statusTextPending,
          ]}
        >
          {visited ? "Visited" : "Pending"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  storeCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  storeCardVisited: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  storeCardPending: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  storeNameVisited: {
    color: "#166534",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  statusBadgeVisited: {
    backgroundColor: "#16A34A",
    borderColor: "#15803D",
  },
  statusBadgePending: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusTextVisited: {
    color: "#FFFFFF",
  },
  statusTextPending: {
    color: "#94A3B8",
  },
  storeMeta: {
    marginTop: 4,
    gap: 2,
  },
  storeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  storeMetaText: {
    fontSize: 11,
    color: "#94A3B8",
    flex: 1,
  },
  storeMetaTextVisited: {
    color: "#4ADE80",
  },
});
