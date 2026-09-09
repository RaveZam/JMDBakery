import { View, Text, StyleSheet } from "react-native";
import type { EndingInventoryRow } from "../../types/ending-inventory-types";
import type { EndingInventoryCountField } from "../../types/ending-inventory-count-field";
import { CountStepper } from "./CountStepper";

/** One product's row: its name plus the bad-order and balance counts. */
export function EndingInventoryProductRow({
  item,
  onStep,
  onSet,
}: {
  item: EndingInventoryRow;
  onStep: (field: EndingInventoryCountField, delta: number) => void;
  onSet: (field: EndingInventoryCountField, next: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.product} numberOfLines={2}>
        {item.productName}
      </Text>
      <CountStepper
        expected={item.expectedBo}
        value={item.endingBo}
        testIDPrefix={`ending-inventory-bo-${item.productId}`}
        onStep={(delta) => onStep("endingBo", delta)}
        onSet={(next) => onSet("endingBo", next)}
      />
      <CountStepper
        expected={item.expectedBalance}
        value={item.endingBalance}
        testIDPrefix={`ending-inventory-balance-${item.productId}`}
        onStep={(delta) => onStep("endingBalance", delta)}
        onSet={(next) => onSet("endingBalance", next)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  product: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0F172A" },
});
