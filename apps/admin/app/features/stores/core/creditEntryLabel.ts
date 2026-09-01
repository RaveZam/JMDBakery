import type { CreditLedgerEntry } from "../types/store-types";

export function creditEntryLabel(entry: CreditLedgerEntry): string {
  if (entry.entryType === "payment") {
    return `Payment · ${entry.recordedByName ?? "Unknown"}`;
  }
  return entry.note ? `Credit · ${entry.note}` : "Credit";
}
