import { View, Text } from "react-native";
import type { CreditEntry } from "../../types/store-types";
import { styles as s } from "./styles";

function formatFullDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DetailHead({ entry }: { entry: CreditEntry }) {
  const isCredit = entry.entryType === "credit";

  return (
    <View style={s.head}>
      <Text style={s.eyebrow}>
        {isCredit ? "CREDIT TAKEN" : "PAYMENT RECEIVED"}
      </Text>
      <Text style={[s.amount, isCredit ? s.amountCredit : s.amountPayment]}>
        ₱{entry.amount.toLocaleString()}
      </Text>
      <Text style={s.meta}>
        {formatFullDate(entry.createdAt)}
        {entry.recordedByName ? ` · Recorded by ${entry.recordedByName}` : ""}
      </Text>
    </View>
  );
}
