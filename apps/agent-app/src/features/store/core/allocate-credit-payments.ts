import type { CreditEntry } from "../types/store-types";

/** How much of each credit entry the store still owes, keyed by entry id. */
export type RemainingByEntryId = Record<string, number>;

// created_at ascending, id as the tie-break so two entries recorded in the
// same second sort the same way on every device.
function oldestFirst(entries: CreditEntry[]): CreditEntry[] {
  return [...entries].sort((left, right) =>
    left.createdAt === right.createdAt
      ? left.id.localeCompare(right.id)
      : left.createdAt.localeCompare(right.createdAt),
  );
}

/**
 * Works out how much of each credit entry is still unpaid.
 *
 * A payment settles the store's running balance rather than one particular
 * credit, so which debts it covers has to be decided by convention: every
 * payment is pooled and handed to the credits oldest first, the way a running
 * tab is normally settled. The oldest debt closes before a newer one starts.
 *
 * Derived on read instead of stored on the row. A payment taken offline
 * colours the ledger correctly before it ever syncs, and two devices holding
 * the same entries always agree — neither is true of a stored status column.
 *
 * Returns remaining owed per credit entry id: 0 for a fully settled entry, the
 * full amount for an untouched one, something between for a partial payment.
 * Payment entries are not in the result; they are the pool, not debts.
 */
export function allocateCreditPayments(
  entries: CreditEntry[],
): RemainingByEntryId {
  let pool = entries
    .filter((entry) => entry.entryType === "payment")
    .reduce((total, entry) => total + entry.amount, 0);

  const remaining: RemainingByEntryId = {};

  for (const credit of oldestFirst(entries)) {
    if (credit.entryType !== "credit") continue;
    const applied = Math.min(pool, credit.amount);
    pool -= applied;
    remaining[credit.id] = credit.amount - applied;
  }

  return remaining;
}
