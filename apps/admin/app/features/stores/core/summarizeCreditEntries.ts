import type { CreditLedgerEntry, CreditSummary } from "../types/store-types";

/**
 * Reduces one store's fetched ledger down to the four summary numbers shown
 * above it: credit taken, paid back, outstanding balance, and the date of
 * the most recent payment.
 */
export function summarizeCreditEntries(
  entries: CreditLedgerEntry[],
): CreditSummary {
  let creditTaken = 0;
  let paidBack = 0;
  let lastPaymentAt: string | null = null;

  for (const entry of entries) {
    if (entry.entryType === "credit") {
      creditTaken += entry.amount;
    } else {
      paidBack += entry.amount;
      if (!lastPaymentAt || entry.createdAt > lastPaymentAt) {
        lastPaymentAt = entry.createdAt;
      }
    }
  }

  return {
    creditTaken,
    paidBack,
    balance: creditTaken - paidBack,
    lastPaymentAt,
  };
}
