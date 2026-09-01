export type StorePaymentEntryInput = {
  id: string;
  storeId: string;
  sessionStoreId: string;
  amount: number;
  outstandingBalance: number;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
};

export type StorePaymentEntry = {
  id: string;
  storeId: string;
  sessionStoreId: string;
  entryType: "payment";
  amount: number;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
};

// Decides whether recording a payment should write a ledger row.
//
// Nothing is written for an amount of zero or less, or for a store that owes
// nothing: the server rejects amount <= 0, so such a row would only jam the
// outbox retrying forever. The amount is not capped here — clampPaymentAmount
// already keeps the field within the balance, and capping again would silently
// shrink a payment two agents recorded against the same balance offline.
//
// sessionStoreId is the visit the payment was collected on, so the session
// history can list it under the right store. It is safe to share with the
// visit's credit row: syncVisitCredit looks entries up with entry_type =
// 'credit', so it never touches a payment.
//
// recordedBy is the agent who collected this payment.
export function buildStorePaymentEntry(
  input: StorePaymentEntryInput,
): StorePaymentEntry | null {
  if (input.amount <= 0) return null;
  if (input.outstandingBalance <= 0) return null;

  return {
    id: input.id,
    storeId: input.storeId,
    sessionStoreId: input.sessionStoreId,
    entryType: "payment",
    amount: input.amount,
    recordedBy: input.recordedBy,
    recordedByName: input.recordedByName,
    createdAt: input.createdAt,
  };
}
