import { StyleSheet, View } from "react-native";
import { QtyStepper } from "./adder-panel-components/QtyStepper";
import { ProductSelector } from "./adder-panel-components/ProductSelector";
import { BadOrderSection } from "./adder-panel-components/BadOrderSection";
import { ReasonPicker } from "./adder-panel-components/ReasonPicker";
import { AddButton } from "./adder-panel-components/AddButton";
import { PaymentTypeToggle } from "./PaymentTypeToggle";
import { useProductQuantity } from "../context/useProductQuantity";

export function AdderPanel() {
  const { sales } = useProductQuantity();

  return (
    <View style={styles.panel}>
      <ProductSelector />
      {!!sales.adder.catalog.selected && (
        <>
          <View style={styles.stepperSection}>
            <QtyStepper
              value={sales.adder.form.quantity}
              onChange={sales.adder.form.setQuantity}
            />
          </View>

          <BadOrderSection badOrder={sales.adder.form.badOrder} />

          <ReasonPicker />

          <PaymentTypeToggle
            value={sales.adder.payment.type}
            onChange={sales.adder.payment.setType}
          />

          <AddButton />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 20 },
  stepperSection: {
    alignItems: "center",
    paddingVertical: 4,
  },
});
