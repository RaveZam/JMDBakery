import { useState } from "react";

import { getSalesBySessionStore } from "../services/sales-services";
import { clampPaymentAmount } from "../core/clamp-payment-amount";
import { useStoreCredit } from "./useStoreCredit";
import type { CreditEntry, LoggedItem } from "../types/store-types";

// Which face of the credit modal is open. Null means it's closed.
export type CreditModalMode = "entry" | "payment" | null;

function useCreditModal(): {
  mode: CreditModalMode;
  entry: CreditEntry | null;
  items: LoggedItem[];
  openEntry: (entry: CreditEntry) => void;
  openPayment: () => void;
  close: () => void;
} {
  const [mode, setMode] = useState<CreditModalMode>(null);
  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const [items, setItems] = useState<LoggedItem[]>([]);

  const openEntry = (selected: CreditEntry): void => {
    setEntry(selected);
    setItems(
      selected.sessionStoreId
        ? getSalesBySessionStore(selected.sessionStoreId)
        : [],
    );
    setMode("entry");
  };

  const close = (): void => {
    setMode(null);
    setEntry(null);
    setItems([]);
  };

  return {
    mode,
    entry,
    items,
    openEntry,
    openPayment: () => setMode("payment"),
    close,
  };
}

function usePaymentDraft(outstandingBalance: number): {
  text: string;
  amount: number;
  setText: (rawText: string) => void;
  payFull: () => void;
  reset: () => void;
} {
  const [text, setTextState] = useState("");
  const draft = clampPaymentAmount(text, outstandingBalance);

  return {
    text: draft.text,
    amount: draft.amount,
    setText: (rawText: string) =>
      setTextState(clampPaymentAmount(rawText, outstandingBalance).text),
    payFull: () => setTextState(String(Math.max(outstandingBalance, 0))),
    reset: () => setTextState(""),
  };
}

/**
 * Drives the credit modal: the detail behind each ledger entry and the payment
 * the agent is drafting against the store's balance. The ledger itself — the
 * entries and the outstanding balance — comes from useStoreCredit.
 *
 * The screen reads `credit.*` without knowing how the visit's items are looked
 * up or how the payable amount is capped.
 */
export function useCredit() {
  const storeCredit = useStoreCredit();
  const modal = useCreditModal();
  const payment = usePaymentDraft(storeCredit.balance);

  const close = (): void => {
    modal.close();
    payment.reset();
  };

  // TODO: write the payment entry + outbox row once the payment service lands.
  const recordPayment = (): void => {
    if (payment.amount <= 0) return;
    close();
    storeCredit.reload();
  };

  return {
    entries: storeCredit.entries,
    balance: storeCredit.balance,
    reload: storeCredit.reload,
    modal: { ...modal, close },
    payment: { ...payment, record: recordPayment },
  };
}

export type CreditController = ReturnType<typeof useCredit>;
