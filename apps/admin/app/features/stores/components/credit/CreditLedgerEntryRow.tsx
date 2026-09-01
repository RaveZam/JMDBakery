import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import { creditEntryLabel } from "../../core/creditEntryLabel";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import type { CreditLedgerEntry } from "../../types/store-types";

// Sign and colour carry the direction: debt up in gold, paid down in green, so
// the two kinds never need reading twice.
function EntryAmount({ entry }: { entry: CreditLedgerEntry }): ReactElement {
  const isPayment = entry.entryType === "payment";

  return (
    <span
      className={`shrink-0 tabular-nums font-semibold ${
        isPayment ? "text-primary" : "text-gold"
      }`}
    >
      {isPayment ? "−" : "+"}
      {formatCurrencyPHP(entry.amount)}
    </span>
  );
}

function EntryContent({ entry }: { entry: CreditLedgerEntry }): ReactElement {
  return (
    <>
      <span className="w-16 shrink-0 tabular-nums text-xs text-muted-foreground">
        {manilaTimestamp.dayShort(entry.createdAt)}
      </span>
      <span className="min-w-0 flex-1 truncate">{creditEntryLabel(entry)}</span>
      <EntryAmount entry={entry} />
    </>
  );
}

export function CreditLedgerEntryRow({
  entry,
  onSelect,
}: {
  entry: CreditLedgerEntry;
  onSelect: (entry: CreditLedgerEntry) => void;
}): ReactElement {
  // Only a credit has orders behind it. A payment is what settles debts rather
  // than being one, so it stays a plain row.
  if (entry.entryType === "payment") {
    return (
      <li className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-sm">
        <EntryContent entry={entry} />
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry)}
        className="flex w-full items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted/40"
      >
        <EntryContent entry={entry} />
      </button>
    </li>
  );
}
