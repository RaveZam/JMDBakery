import type { ReactElement } from "react";
import { Banknote } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import type { SessionPaymentRow } from "../types/session-types";

// What the store paid off its balance on this visit. Kept apart from the order
// total above it — a payment settles old debt, it is not part of today's sales.
export function StorePaymentsList({
  payments,
}: {
  payments: SessionPaymentRow[];
}): ReactElement | null {
  if (payments.length === 0) return null;

  return (
    <ul className="mt-2 border-t border-border/50 px-3 pt-2 text-xs">
      {payments.map((payment) => (
        <li key={payment.id} className="flex items-center gap-2 py-1">
          <Banknote className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            Payment collected
            {payment.recordedByName ? ` · ${payment.recordedByName}` : ""}
          </span>
          <span className="whitespace-nowrap text-muted-foreground">
            {manilaTimestamp.time(payment.createdAt)}
          </span>
          <span className="tabular-nums font-semibold text-primary">
            {formatCurrencyPHP(payment.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}
