import type { CreditLedgerEntry } from "../types/store-types";

export function creditEntryLabel(entry: CreditLedgerEntry): string {
  if (entry.entryType === "payment") {
    return `Payment · ${entry.recordedByName ?? "Unknown"}`;
  }
  const credit = `Credit · ${entry.recordedByName ?? "Unknown"}`;
  return entry.note ? `${credit} · ${entry.note}` : credit;
}
