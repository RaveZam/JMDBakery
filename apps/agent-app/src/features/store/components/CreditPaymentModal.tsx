import {
  Modal,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import type { CreditController } from "../hooks/useCredit";
import { CreditDetailView } from "./credit-modal-components/CreditDetailView";
import { PaymentFormView } from "./credit-modal-components/PaymentFormView";
import { creditModalStyles as s } from "./credit-modal-components/creditModalStyles";

/**
 * The credit slip. Opening a ledger row shows what that entry was — items,
 * agent, date — and from there the agent can record a payment against the
 * store's outstanding balance without leaving the modal.
 */
export function CreditPaymentModal({ credit }: { credit: CreditController }) {
  return (
    <Modal
      visible={credit.modal.mode !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={credit.modal.close}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tapping outside the slip dismisses it; taps on the slip are swallowed. */}
        <Pressable style={m.backdrop} onPress={credit.modal.close}>
          <Pressable style={s.card} onPress={() => {}}>
            <View>
              {credit.modal.mode === "payment" ? (
                <PaymentFormView credit={credit} />
              ) : (
                <CreditDetailView credit={credit} />
              )}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
