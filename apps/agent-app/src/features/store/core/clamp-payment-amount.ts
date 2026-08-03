export type PaymentAmountDraft = {
  text: string; // what the input field should show
  amount: number; // what would actually be paid
};

// Keeps the payment field payable: whole pesos only, never more than the
// store still owes. Typing past the balance snaps back to the balance rather
// than rejecting the keystroke, so the field can't hold an unpayable number.
export function clampPaymentAmount(
  rawText: string,
  outstandingBalance: number,
): PaymentAmountDraft {
  const digitsOnly = rawText.replace(/[^0-9]/g, "");
  if (digitsOnly === "") return { text: "", amount: 0 };

  const maximum = Math.max(outstandingBalance, 0);
  const amount = Math.min(Number(digitsOnly), maximum);
  return { text: String(amount), amount };
}
