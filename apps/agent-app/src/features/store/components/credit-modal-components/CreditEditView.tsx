import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { CreditController } from "../../hooks/useCredit";
import { creditModalStyles as s, FAINT } from "./creditModalStyles";

// The form says the same thing either way — here is the number on the ledger,
// type the one that's true — so only the wording changes with the entry type.
const COPY = {
  credit: {
    eyebrow: "EDIT CREDIT",
    helper: "What this store actually owes for the visit",
  },
  payment: {
    eyebrow: "EDIT PAYMENT",
    helper: "What this store actually handed over",
  },
} as const;

function EditHead({ credit }: { credit: CreditController }) {
  const entry = credit.modal.entry;
  const isCredit = entry?.entryType === "credit";

  return (
    <View style={s.head}>
      <Text style={s.eyebrow}>
        {COPY[isCredit ? "credit" : "payment"].eyebrow}
      </Text>
      <Text style={[s.amount, isCredit ? s.amountCredit : s.amountPayment]}>
        ₱{(entry?.amount ?? 0).toLocaleString()}
      </Text>
      <Text style={s.meta}>Currently on the ledger</Text>
    </View>
  );
}

function AmountField({ credit }: { credit: CreditController }) {
  const isCredit = credit.modal.entry?.entryType === "credit";

  return (
    <View style={s.body}>
      <View style={s.amountField}>
        <Text style={s.peso}>₱</Text>
        <TextInput
          style={s.amountInput}
          value={credit.edit.text}
          onChangeText={credit.edit.setText}
          placeholder="0"
          placeholderTextColor={FAINT}
          keyboardType="number-pad"
          autoFocus
        />
      </View>
      <Text style={s.helperText}>
        {COPY[isCredit ? "credit" : "payment"].helper}
      </Text>
    </View>
  );
}

// Corrects the amount on a ledger entry — a debt taken or a payment collected.
// Only the amount: who, when, and the delivery it belongs to are facts about
// the visit, not typos.
//
// A corrected payment is not capped at the balance, the same way a new one
// isn't: an overpayment is a real thing a store can do, and the ledger shows it
// as credit on account.
export function CreditEditView({ credit }: { credit: CreditController }) {
  const canSave = credit.edit.amount > 0;

  return (
    <>
      <EditHead credit={credit} />
      <View style={s.tornEdge} />
      <AmountField credit={credit} />
      <View style={s.actions}>
        <TouchableOpacity
          style={s.secondaryButton}
          onPress={credit.modal.close}
        >
          <Text style={s.secondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryButton, !canSave && s.primaryButtonDisabled]}
          onPress={credit.edit.save}
          disabled={!canSave}
        >
          <Text style={s.primaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
