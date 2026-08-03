import type { CreditEntry } from "../types/store-types";

// Outstanding balance for a store: what it owes minus what it has paid back.
export function computeCreditBalance(entries: CreditEntry[]): number {
  return entries.reduce((balance, entry) => {
    return entry.entryType === "credit"
      ? balance + entry.amount
      : balance - entry.amount;
  }, 0);
}
