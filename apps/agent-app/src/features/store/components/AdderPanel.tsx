import { StyleSheet, View } from "react-native";
import { QtyStepper } from "./adder-panel-components/QtyStepper";
import { ProductSelector } from "./adder-panel-components/ProductSelector";
import { BadOrderSection } from "./adder-panel-components/BadOrderSection";
import { ReasonPicker } from "./adder-panel-components/ReasonPicker";
import { AddButton } from "./adder-panel-components/AddButton";
import { PaymentTypeToggle } from "./PaymentTypeToggle";
import { useProductQuantity } from "../context/useProductQuantity";

export function AdderPanel() {
  const { adderModal, storeDetails } = useProductQuantity();

  return (
    <View style={styles.panel}>
      <ProductSelector />
      {!!adderModal.inventory.selectedProduct && (
        <>
          <View style={styles.stepperSection}>
            <QtyStepper
              value={adderModal.inventory.quantity}
              onChange={adderModal.inventory.setQuantity}
            />
          </View>

          <BadOrderSection
            value={adderModal.inventory.boQty}
            onChange={adderModal.inventory.setBoQty}
            needsReason={adderModal.inventory.needsReason}
          />

          <ReasonPicker />

          <PaymentTypeToggle
            value={storeDetails.paymentType}
            onChange={storeDetails.setPaymentType}
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
