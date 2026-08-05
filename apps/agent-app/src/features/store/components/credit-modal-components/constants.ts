// The edit form says the same thing either way — here is the number on the
// ledger, type the one that's true — so only the wording changes with the
// entry type.
export const CREDIT_EDIT_COPY = {
  credit: {
    eyebrow: "EDIT CREDIT",
    helper: "What this store actually owes for the visit",
  },
  payment: {
    eyebrow: "EDIT PAYMENT",
    helper: "What this store actually handed over",
  },
} as const;
