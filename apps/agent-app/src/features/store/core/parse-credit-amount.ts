export type CreditAmountDraft = {
  text: string; // what the input field should show
  amount: number; // what the entry would be corrected to
};

// Keeps the credit-amount field to whole pesos. Unlike a payment there is no
// ceiling: correcting a debt upward is exactly what an agent is here to do, so
// the only thing filtered out is anything that isn't a digit.
export function parseCreditAmount(rawText: string): CreditAmountDraft {
  const digitsOnly = rawText.replace(/[^0-9]/g, "");
  if (digitsOnly === "") return { text: "", amount: 0 };

  const amount = Number(digitsOnly);
  return { text: String(amount), amount };
}
