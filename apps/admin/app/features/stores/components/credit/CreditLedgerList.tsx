import type { ReactElement } from "react";

import type { CreditLedgerEntry } from "../../types/store-types";
import { CreditLedgerEntryRow } from "./CreditLedgerEntryRow";

export function CreditLedgerList({
  entries,
  onSelect,
}: {
  entries: CreditLedgerEntry[];
  onSelect: (entry: CreditLedgerEntry) => void;
}): ReactElement {
  return (
    <ul className="divide-y divide-border/60">
      {entries.map((entry) => (
        <CreditLedgerEntryRow key={entry.id} entry={entry} onSelect={onSelect} />
      ))}
    </ul>
  );
}
