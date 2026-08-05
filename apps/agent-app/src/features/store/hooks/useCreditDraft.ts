import { useState } from "react";

import { clampPaymentAmount } from "../core/clamp-payment-amount";
import { parseCreditAmount } from "../core/parse-credit-amount";
import type { CreditModalMode } from "../types/store-types";

/**
 * The one amount field in the modal. Both forms that have one — recording a
 * payment and correcting an entry — are never on screen at the same time, so
 * they share a single draft and the rule that sanitizes it follows the mode:
 * a payment is capped at what the store still owes, a correction is not (an
 * overpayment is a real thing, and the ledger shows it as credit on account).
 */
export function useCreditDraft(
  mode: CreditModalMode,
  outstandingBalance: number,
) {
  const [text, setText] = useState("");

  function sanitize(rawText: string) {
    return mode === "payment"
      ? clampPaymentAmount(rawText, outstandingBalance)
      : parseCreditAmount(rawText);
  }

  const draft = sanitize(text);

  function setDraftText(rawText: string): void {
    setText(sanitize(rawText).text);
  }

  function seed(amount: number): void {
    setText(String(amount));
  }

  function clear(): void {
    setText("");
  }

  return {
    text: draft.text,
    amount: draft.amount,
    setText: setDraftText,
    seed,
    clear,
  };
}
