import {
  Modal,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import type { CreditController } from "../hooks/useCredit";
import type { CreditEntry } from "../types/store-types";
import { CreditDetailView } from "./credit-modal-components/CreditDetailView";
import { CreditEditView } from "./credit-modal-components/CreditEditView";
import { PaymentFormView } from "./credit-modal-components/PaymentFormView";
import { styles as s } from "./credit-modal-components/styles";

// The two views that are about one ledger row. Taking the entry as a prop is
// what lets them be typed non-null: the mode already guarantees there is one.
function EntryModalContent({
  credit,
  entry,
}: {
  credit: CreditController;
  entry: CreditEntry;
}) {
  if (credit.mode === "edit") {
    return (
      <CreditEditView
        entry={entry}
        text={credit.draftText}
        canSave={credit.draftAmount > 0}
        onChangeText={credit.setDraftText}
        onCancel={credit.close}
        onSave={credit.save}
      />
    );
  }

  return (
    <CreditDetailView
      entry={entry}
      items={credit.items}
      canPay={credit.balance > 0}
      canModify={credit.canModify}
      onClose={credit.close}
      onPay={credit.openPayment}
      onEdit={credit.openEdit}
      onDelete={credit.remove}
    />
  );
}

/**
 * Which view the mode calls for. This is the only piece that holds the whole
 * controller — each view gets just the values and callbacks it uses, so none
 * of them has to guard against a state the mode already rules out.
 */
function ModalContent({ credit }: { credit: CreditController }) {
  if (credit.mode === "payment") {
    return (
      <PaymentFormView
        balance={credit.balance}
        text={credit.draftText}
        canRecord={credit.draftAmount > 0}
        onChangeText={credit.setDraftText}
        onPayFull={credit.payFull}
        onCancel={credit.close}
        onRecord={credit.record}
      />
    );
  }

  if (credit.mode === null || !credit.entry) return null;

  return <EntryModalContent credit={credit} entry={credit.entry} />;
}

/**
 * The credit modal. Opening a ledger row shows what that entry was — items,
 * agent, date — and from there the agent can record a payment against the
 * store's outstanding balance without leaving the modal.
 */
export function CreditPaymentModal({ credit }: { credit: CreditController }) {
  return (
    <Modal
      visible={credit.mode !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={credit.close}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tapping outside the modal dismisses it; taps on it are swallowed. */}
        <Pressable style={m.backdrop} onPress={credit.close}>
          <Pressable style={s.card} onPress={() => {}}>
            <View>
              <ModalContent credit={credit} />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
