import { View, Text, TouchableOpacity } from "react-native";
import type { CreditEntry, LoggedItem } from "../../types/store-types";
import { DetailHead } from "./DetailHead";
import { DetailItems } from "./DetailItems";
import { OwnerActions } from "./OwnerActions";
import { styles as s } from "./styles";

type CreditDetailViewProps = {
  entry: CreditEntry;
  items: LoggedItem[];
  canPay: boolean;
  canModify: boolean;
  onClose: () => void;
  onPay: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

// The credit ledger entry behind a row: what was taken, by whom, when, and the
// items it paid for. Only an unpaid store can go straight to recording payment.
export function CreditDetailView({
  entry,
  items,
  canPay,
  canModify,
  onClose,
  onPay,
  onEdit,
  onDelete,
}: CreditDetailViewProps) {
  return (
    <>
      <DetailHead entry={entry} />
      <View style={s.tornEdge} />
      <DetailItems items={items} />
      <View style={s.actionStack}>
        <OwnerActions
          canModify={canModify}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <View style={s.actionRow}>
          <TouchableOpacity style={s.secondaryButton} onPress={onClose}>
            <Text style={s.secondaryText}>Close</Text>
          </TouchableOpacity>
          {canPay && (
            <TouchableOpacity style={s.primaryButton} onPress={onPay}>
              <Text style={s.primaryText} numberOfLines={1}>
                Record payment
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}
