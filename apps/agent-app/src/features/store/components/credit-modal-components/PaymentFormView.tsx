import { View, Text, TextInput, TouchableOpacity } from "react-native";
import type { CreditController } from "../../hooks/useCredit";
import { creditModalStyles as s, FAINT } from "./creditModalStyles";

function AmountField({ credit }: { credit: CreditController }) {
  return (
    <View style={s.body}>
      <View style={s.amountField}>
        <Text style={s.peso}>₱</Text>
        <TextInput
          style={s.amountInput}
          value={credit.payment.text}
          onChangeText={credit.payment.setText}
          placeholder="0"
          placeholderTextColor={FAINT}
          keyboardType="number-pad"
          autoFocus
        />
      </View>
      <View style={s.helperRow}>
        <Text style={s.helperText}>
          Up to ₱{credit.balance.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={s.payFullChip}
          onPress={credit.payment.payFull}
        >
          <Text style={s.payFullText}>Pay full</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Collects a payment against the outstanding balance. The field itself is
// capped at the balance, so the only thing left to block is an empty amount.
export function PaymentFormView({ credit }: { credit: CreditController }) {
  const canRecord = credit.payment.amount > 0;

  return (
    <>
      <View style={s.head}>
        <Text style={s.eyebrow}>RECORD PAYMENT</Text>
        <Text style={s.amount}>₱{credit.balance.toLocaleString()}</Text>
        <Text style={s.meta}>Outstanding balance</Text>
      </View>
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
          style={[s.primaryButton, !canRecord && s.primaryButtonDisabled]}
          onPress={credit.payment.record}
          disabled={!canRecord}
        >
          <Text style={s.primaryText}>Record payment</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
