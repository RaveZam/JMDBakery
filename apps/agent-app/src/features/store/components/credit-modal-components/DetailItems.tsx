import { View, Text } from "react-native";
import type { LoggedItem } from "../../types/store-types";
import { CreditItemLine } from "./CreditItemLine";
import { styles as s } from "./styles";

export function DetailItems({ items }: { items: LoggedItem[] }) {
  if (items.length === 0) {
    return (
      <View style={s.body}>
        <Text style={s.emptyNote}>
          No items recorded for this entry. It was logged against the store, not
          against a delivery.
        </Text>
      </View>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <View style={s.body}>
      <Text style={s.bodyLabel}>WHAT THIS CREDIT COVERS</Text>
      {items.map((item) => (
        <CreditItemLine key={item.saleId} item={item} />
      ))}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Delivered total</Text>
        <Text style={s.totalValue}>₱{total.toLocaleString()}</Text>
      </View>
    </View>
  );
}
