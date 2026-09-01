import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import { creditEntryLabel } from "../../core/creditEntryLabel";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import type { CreditLedgerEntry } from "../../types/store-types";

export function CreditLedgerEntryRow({
  entry,
}: {
  entry: CreditLedgerEntry;
}): ReactElement {
  const isPayment = entry.entryType === "payment";
  const day = manilaTimestamp.dayShort(entry.createdAt);

  return (
    <li className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/40">
      <span className="w-16 shrink-0 tabular-nums text-xs text-muted-foreground">
        {day}
      </span>
      <span className="min-w-0 flex-1 truncate">{creditEntryLabel(entry)}</span>
      {/* Sign and colour carry the direction: debt up in gold, paid down in
          green, so the two kinds never need reading twice. */}
      <span
        className={`shrink-0 tabular-nums font-semibold ${
          isPayment ? "text-primary" : "text-gold"
        }`}
      >
        {isPayment ? "−" : "+"}
        {formatCurrencyPHP(entry.amount)}
      </span>
    </li>
  );
}
