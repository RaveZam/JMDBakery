import { View, Text, TextInput } from "react-native";
import type { CreditEntry } from "../../types/store-types";
import { CREDIT_EDIT_COPY } from "./constants";
import { styles as s, FAINT } from "./styles";

export function EditAmountField({
  entry,
  text,
  onChangeText,
}: {
  entry: CreditEntry;
  text: string;
  onChangeText: (rawText: string) => void;
}) {
  const isCredit = entry.entryType === "credit";

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
      <Text style={s.helperText}>
        {CREDIT_EDIT_COPY[isCredit ? "credit" : "payment"].helper}
      </Text>
    </View>
  );
}
