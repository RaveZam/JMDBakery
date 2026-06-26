import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StoreRow } from "../../types/db-rows";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  store: StoreRow | null;
  onClose: () => void;
};

function formatLocation(store: StoreRow): string {
  return [store.barangay, store.city, store.province]
    .filter(Boolean)
    .join(", ");
}

export function ViewStoreModal({ store, onClose }: Props) {
  const location = store ? formatLocation(store) : "";

  return (
    <Modal
      visible={!!store}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={m.backdrop}>
        <View style={m.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="storefront-outline" size={26} color="#1b6e40" />
          </View>
          <Text style={m.title}>{store?.name}</Text>

          <View style={styles.fields}>
            {location ? (
              <View style={styles.row}>
                <Ionicons name="location-outline" size={15} color="#64748B" />
                <Text style={styles.fieldText}>{location}</Text>
              </View>
            ) : null}
            {store?.contact_name ? (
              <View style={styles.row}>
                <Ionicons name="person-outline" size={15} color="#64748B" />
                <Text style={styles.fieldText}>{store.contact_name}</Text>
              </View>
            ) : null}
            {store?.contact_number ? (
              <View style={styles.row}>
                <Ionicons name="call-outline" size={15} color="#64748B" />
                <Text style={styles.fieldText}>{store.contact_number}</Text>
              </View>
            ) : null}
            {!location && !store?.contact_name && !store?.contact_number && (
              <Text style={styles.emptyText}>No additional details.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={m.cancelText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  fields: {
    width: "100%",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  closeButton: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
});
