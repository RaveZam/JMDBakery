import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles as s, FAINT } from "./styles";

export function PaymentAmountField({
  balance,
  text,
  onChangeText,
  onPayFull,
}: {
  balance: number;
  text: string;
  onChangeText: (rawText: string) => void;
  onPayFull: () => void;
}) {
  return (
    <View style={s.body}>
      <View style={s.amountField}>
        <Text style={s.peso}>₱</Text>
        <TextInput
          style={s.amountInput}
          value={text}
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={FAINT}
          keyboardType="number-pad"
          autoFocus
        />
      </View>
      <View style={s.helperRow}>
        <Text style={s.helperText}>Up to ₱{balance.toLocaleString()}</Text>
        <TouchableOpacity style={s.payFullChip} onPress={onPayFull}>
          <Text style={s.payFullText}>Pay full</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
