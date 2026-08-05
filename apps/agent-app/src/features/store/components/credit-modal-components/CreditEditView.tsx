import { View, Text, TouchableOpacity } from "react-native";
import type { CreditEntry } from "../../types/store-types";
import { EditAmountField } from "./EditAmountField";
import { EditHead } from "./EditHead";
import { styles as s } from "./styles";

type CreditEditViewProps = {
  entry: CreditEntry;
  text: string;
  canSave: boolean;
  onChangeText: (rawText: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

// Corrects the amount on a ledger entry — a debt taken or a payment collected.
// Only the amount: who, when, and the delivery it belongs to are facts about
// the visit, not typos.
//
// A corrected payment is not capped at the balance, the same way a new one
// isn't: an overpayment is a real thing a store can do, and the ledger shows it
// as credit on account.
export function CreditEditView({
  entry,
  text,
  canSave,
  onChangeText,
  onCancel,
  onSave,
}: CreditEditViewProps) {
  return (
    <>
      <EditHead entry={entry} />
      <View style={s.tornEdge} />
      <EditAmountField entry={entry} text={text} onChangeText={onChangeText} />
      <View style={s.actions}>
        <TouchableOpacity style={s.secondaryButton} onPress={onCancel}>
          <Text style={s.secondaryText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.primaryButton, !canSave && s.primaryButtonDisabled]}
          onPress={onSave}
          disabled={!canSave}
        >
          <Text style={s.primaryText}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
