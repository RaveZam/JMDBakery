export type StorePaymentEntryInput = {
  id: string;
  storeId: string;
  amount: number;
  outstandingBalance: number;
  recordedBy: string;
  recordedByName: string;
  tenderedBy: string | null;
  tenderedByName: string | null;
  createdAt: string;
};

export type StorePaymentEntry = {
  id: string;
  storeId: string;
  sessionStoreId: null;
  entryType: "payment";
  amount: number;
  recordedBy: string;
  recordedByName: string;
  tenderedBy: string | null;
  tenderedByName: string | null;
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
// sessionStoreId is always null. A payment settles the store's running
// balance, not one visit, and that null is what keeps applyVisitCredit — which
// looks entries up by session_store_id — from ever touching a payment.
export function buildStorePaymentEntry(
  input: StorePaymentEntryInput,
): StorePaymentEntry | null {
  if (input.amount <= 0) return null;
  if (input.outstandingBalance <= 0) return null;

  // Null means "the same person who recorded it", so a collector who is also
  // the recorder is stored the one way rather than two.
  const collectorIsRecorder =
    input.tenderedBy === null || input.tenderedBy === input.recordedBy;

  return {
    id: input.id,
    storeId: input.storeId,
    sessionStoreId: null,
    entryType: "payment",
    amount: input.amount,
    recordedBy: input.recordedBy,
    recordedByName: input.recordedByName,
    tenderedBy: collectorIsRecorder ? null : input.tenderedBy,
    tenderedByName: collectorIsRecorder ? null : input.tenderedByName,
    createdAt: input.createdAt,
  };
}
