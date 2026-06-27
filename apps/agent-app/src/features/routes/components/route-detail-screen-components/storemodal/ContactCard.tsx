import { View, Text } from "react-native";
import { StoreRow } from "../../../types/db-rows";
import { DetailRow } from "./DetailRow";
import { styles } from "./styles";

export function ContactCard({ store }: { store: StoreRow }) {
  const hasName = !!store.contact_name;
  const hasNumber = !!store.contact_number;

  if (!hasName && !hasNumber) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No contact details yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {hasName ? (
        <DetailRow icon="person-outline" text={store.contact_name!} />
      ) : null}
      {hasName && hasNumber ? <View style={styles.divider} /> : null}
      {hasNumber ? (
        <DetailRow icon="call-outline" text={store.contact_number!} />
      ) : null}
    </View>
  );
}
