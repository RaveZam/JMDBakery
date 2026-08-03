import { View, Text, TouchableOpacity } from "react-native";
import type { CreditController } from "../../hooks/useCredit";
import type { CreditEntry, LoggedItem } from "../../types/store-types";
import { CreditItemLine } from "./CreditItemLine";
import { creditModalStyles as s } from "./creditModalStyles";

function formatFullDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DetailHead({ entry }: { entry: CreditEntry }) {
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

function DetailItems({ items }: { items: LoggedItem[] }) {
  if (items.length === 0) {
    return (
      <View style={s.body}>
        <Text style={s.emptyNote}>
          No items recorded for this entry. It was logged against the store, not
          against a delivery.
        </Text>
      </View>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <View style={s.body}>
      <Text style={s.bodyLabel}>WHAT THIS CREDIT COVERS</Text>
      {items.map((item) => (
        <CreditItemLine key={item.saleId} item={item} />
      ))}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Delivered total</Text>
        <Text style={s.totalValue}>₱{total.toLocaleString()}</Text>
      </View>
    </View>
  );
}

// The credit ledger entry behind a row: what was taken, by whom, when, and the
// items it paid for. Only an unpaid store can go straight to recording payment.
export function CreditDetailView({ credit }: { credit: CreditController }) {
  const entry = credit.modal.entry;
  if (!entry) return null;

  const canPay = credit.balance > 0;

  return (
    <>
      <DetailHead entry={entry} />
      <View style={s.tornEdge} />
      <DetailItems items={credit.modal.items} />
      <View style={s.actions}>
        <TouchableOpacity
          style={s.secondaryButton}
          onPress={credit.modal.close}
        >
          <Text style={s.secondaryText}>Close</Text>
        </TouchableOpacity>
        {canPay && (
          <TouchableOpacity
            style={s.primaryButton}
            onPress={credit.modal.openPayment}
          >
            <Text style={s.primaryText}>Record payment</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
