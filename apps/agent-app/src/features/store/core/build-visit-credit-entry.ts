export type VisitCreditEntryInput = {
  id: string;
  sessionStoreId: string;
  storeId: string;
  paymentType: "cash" | "credit";
  netTotal: number;
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

// Decides whether confirming this visit should write a credit entry.
// Cash visits never do. A credit visit with nothing owed (net total 0 or
// less) doesn't either — the server rejects amount <= 0, so writing one would
// only jam the outbox retrying forever.
export function buildVisitCreditEntry(
  input: VisitCreditEntryInput,
): VisitCreditEntry | null {
  if (input.paymentType !== "credit") return null;
  if (input.netTotal <= 0) return null;

  return {
    id: input.id,
    storeId: input.storeId,
    sessionStoreId: input.sessionStoreId,
    entryType: "credit",
    amount: input.netTotal,
    recordedBy: input.recordedBy,
    recordedByName: input.recordedByName,
    createdAt: input.createdAt,
  };
}
