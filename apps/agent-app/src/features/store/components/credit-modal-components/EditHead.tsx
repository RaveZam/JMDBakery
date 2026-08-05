import { View, Text } from "react-native";
import type { CreditEntry } from "../../types/store-types";
import { CREDIT_EDIT_COPY } from "./constants";
import { styles as s } from "./styles";

export function EditHead({ entry }: { entry: CreditEntry }) {
  const isCredit = entry.entryType === "credit";

  return (
    <View style={s.head}>
      <Text style={s.eyebrow}>
        {CREDIT_EDIT_COPY[isCredit ? "credit" : "payment"].eyebrow}
      </Text>
      <Text style={[s.amount, isCredit ? s.amountCredit : s.amountPayment]}>
        ₱{entry.amount.toLocaleString()}
      </Text>
      <Text style={s.meta}>Currently on the ledger</Text>
    </View>
  );
}
