import { View, Text, TouchableOpacity } from "react-native";
import { PaymentAmountField } from "./PaymentAmountField";
import { styles as s } from "./styles";

type PaymentFormViewProps = {
  balance: number;
  text: string;
  canRecord: boolean;
  onChangeText: (rawText: string) => void;
  onPayFull: () => void;
  onCancel: () => void;
  onRecord: () => void;
};

// Collects a payment against the outstanding balance. The field itself is
// capped at the balance, so the only thing left to block is an empty amount.
export function PaymentFormView({
  balance,
  text,
  canRecord,
  onChangeText,
  onPayFull,
  onCancel,
  onRecord,
}: PaymentFormViewProps) {
  return (
    <>
      <View style={s.head}>
        <Text style={s.eyebrow}>RECORD PAYMENT</Text>
        <Text style={s.amount}>₱{balance.toLocaleString()}</Text>
        <Text style={s.meta}>Outstanding balance</Text>
      </View>
      <View style={s.tornEdge} />
      <PaymentAmountField
        balance={balance}
        text={text}
        onChangeText={onChangeText}
        onPayFull={onPayFull}
      />
      <View style={s.actions}>
        <TouchableOpacity style={s.secondaryButton} onPress={onCancel}>
          <Text style={s.secondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryButton, !canRecord && s.primaryButtonDisabled]}
          onPress={onRecord}
          disabled={!canRecord}
        >
          <Text style={s.primaryText}>Record payment</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
