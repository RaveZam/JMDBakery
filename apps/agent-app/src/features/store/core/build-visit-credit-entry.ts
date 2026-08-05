export type VisitCreditEntryInput = {
  id: string;
  sessionStoreId: string;
  storeId: string;
  creditTotal: number;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
};

export type VisitCreditEntry = {
  id: string;
  storeId: string;
  sessionStoreId: string;
  entryType: "credit";
  amount: number;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
};

// Decides whether this visit should carry a credit entry, given what its
// credit-marked orders come to. Nothing owed means no entry: a stop paid
// entirely in cash sums to 0, and the server rejects amount <= 0 anyway, so
// writing one would only jam the outbox retrying forever.
export function buildVisitCreditEntry(
  input: VisitCreditEntryInput,
): VisitCreditEntry | null {
  if (input.creditTotal <= 0) return null;

  return {
    id: input.id,
    storeId: input.storeId,
    sessionStoreId: input.sessionStoreId,
    entryType: "credit",
    amount: input.creditTotal,
    recordedBy: input.recordedBy,
    recordedByName: input.recordedByName,
    createdAt: input.createdAt,
  };
}
