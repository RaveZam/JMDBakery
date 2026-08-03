import { View, Text } from "react-native";
import type { LoggedItem } from "../../types/store-types";
import { creditModalStyles as s } from "./creditModalStyles";

// One product line of the visit that created this credit.
export function CreditItemLine({ item }: { item: LoggedItem }) {
  return (
    <View style={s.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.itemName}>{item.productName}</Text>
        {item.boQty > 0 && (
          <Text style={s.itemBadOrder}>
            {item.boQty} bad order{item.boReason ? ` — ${item.boReason}` : ""}
          </Text>
        )}
      </View>
      <Text style={s.itemQty}>×{item.qty}</Text>
      <Text style={s.itemAmount}>
        ₱{(item.price * item.qty).toLocaleString()}
      </Text>
    </View>
  );
}
