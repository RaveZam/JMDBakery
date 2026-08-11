import type { ReactElement } from "react";

import { formatCurrencyPHP } from "@/lib/utils";
import type { CreditLedgerEntry } from "../types/store-types";

function entryLabel(entry: CreditLedgerEntry): string {
  if (entry.entryType === "payment") {
    return `Payment · ${entry.tenderedByName ?? "Unknown"}`;
  }
  return entry.note ? `Credit · ${entry.note}` : "Credit";
}

function EntryRow({ entry }: { entry: CreditLedgerEntry }): ReactElement {
  const isPayment = entry.entryType === "payment";
  const day = new Date(entry.createdAt).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });

  return (
    <li className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/40">
      <span className="w-16 shrink-0 tabular-nums text-xs text-muted-foreground">
        {day}
      </span>
      <span className="min-w-0 flex-1 truncate">{entryLabel(entry)}</span>
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

export function CreditLedgerList({
  entries,
}: {
  entries: CreditLedgerEntry[];
}): ReactElement {
  return (
    <ul className="divide-y divide-border/60">
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
