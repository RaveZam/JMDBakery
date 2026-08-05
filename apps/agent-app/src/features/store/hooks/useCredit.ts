import { useState } from "react";
import { Alert } from "react-native";

import {
  deleteCreditEntry,
  getCreditEntryItems,
  recordStorePayment,
  updateCreditEntryAmount,
} from "../services/store-credit-service";
import { clampPaymentAmount } from "../core/clamp-payment-amount";
import { parseCreditAmount } from "../core/parse-credit-amount";
import { canModifyCreditEntry } from "../core/can-modify-credit-entry";
import { getCurrentUserId } from "@/src/lib/current-user";
import { useStoreCredit } from "./useStoreCredit";
import type { CreditEntry, LoggedItem } from "../types/store-types";

// Which face of the credit modal is open. Null means it's closed.
export type CreditModalMode = "entry" | "payment" | "edit" | null;

function useCreditModal(): {
  mode: CreditModalMode;
  entry: CreditEntry | null;
  items: LoggedItem[];
  openEntry: (entry: CreditEntry) => void;
  openPayment: () => void;
  openEdit: () => void;
  close: () => void;
} {
  const [mode, setMode] = useState<CreditModalMode>(null);
  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const [items, setItems] = useState<LoggedItem[]>([]);

  const openEntry = (selected: CreditEntry): void => {
    setEntry(selected);
    setItems(
      selected.sessionStoreId
        ? getCreditEntryItems(selected.sessionStoreId)
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
    openEdit: () => setMode("edit"),
    close,
  };
}

// The amount field on the edit form, seeded from the entry being corrected so
// the agent adjusts a number rather than retyping one.
function useAmountDraft(): {
  text: string;
  amount: number;
  setText: (rawText: string) => void;
  seed: (amount: number) => void;
  reset: () => void;
} {
  const [text, setTextState] = useState("");
  const draft = parseCreditAmount(text);

  return {
    text: draft.text,
    amount: draft.amount,
    setText: (rawText: string) => setTextState(parseCreditAmount(rawText).text),
    seed: (amount: number) => setTextState(String(amount)),
    reset: () => setTextState(""),
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

type EditControllerInput = {
  entry: CreditEntry | null;
  openSessionStoreId: string | null;
  draft: ReturnType<typeof useAmountDraft>;
  showForm: () => void;
  afterWrite: () => void;
};

type EditController = {
  text: string;
  amount: number;
  setText: (rawText: string) => void;
  canModify: boolean;
  open: () => void;
  save: () => void;
  remove: () => void;
};

/**
 * The payment form, ready to submit. A payment needs a visit to hang off, so
 * nothing is recorded when the screen has no session store — same for an
 * amount the server would reject.
 */
function buildPaymentController(
  draft: ReturnType<typeof usePaymentDraft>,
  sessionStoreId: string | undefined,
  afterWrite: () => void,
): ReturnType<typeof usePaymentDraft> & { record: () => void } {
  return {
    ...draft,
    record: () => {
      if (draft.amount <= 0 || !sessionStoreId) return;
      recordStorePayment({ sessionStoreId, amount: draft.amount });
      afterWrite();
    },
  };
}

// Deleting a ledger row is not undoable from the app, so it asks first. A
// deleted payment puts the debt back up, which is worth saying out loud.
function confirmRemove(entry: CreditEntry, afterWrite: () => void): void {
  const isCredit = entry.entryType === "credit";

  Alert.alert(
    isCredit ? "Delete this credit?" : "Delete this payment?",
    isCredit
      ? `Remove ₱${entry.amount.toLocaleString()} from this store's ledger.`
      : `₱${entry.amount.toLocaleString()} goes back onto what this store owes.`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCreditEntry(entry.id);
          afterWrite();
        },
      },
    ],
  );
}

/**
 * Correcting or removing the entry the slip is open on. Holds no state of its
 * own — the draft and the open entry are passed in — so it's assembled on each
 * render rather than being a hook.
 */
function buildEditController(input: EditControllerInput): EditController {
  const { entry, openSessionStoreId, draft, showForm, afterWrite } = input;

  return {
    text: draft.text,
    amount: draft.amount,
    setText: draft.setText,
    canModify:
      entry !== null &&
      canModifyCreditEntry(entry, getCurrentUserId(), openSessionStoreId),
    open: () => {
      if (!entry) return;
      draft.seed(entry.amount);
      showForm();
    },
    save: () => {
      if (!entry || draft.amount <= 0) return;
      updateCreditEntryAmount(entry.id, draft.amount);
      afterWrite();
    },
    remove: () => entry && confirmRemove(entry, afterWrite),
  };
}

/**
 * The two ways the slip goes away. Closing drops both drafts, so a half-typed
 * correction never reappears on the next entry opened. Every write to the
 * ledger goes one step further and re-reads the entries, so the balance and the
 * tab badge follow immediately.
 */
function buildDismiss(
  modal: ReturnType<typeof useCreditModal>,
  payment: ReturnType<typeof usePaymentDraft>,
  amountDraft: ReturnType<typeof useAmountDraft>,
  reload: () => void,
): { close: () => void; closeAndReload: () => void } {
  const close = (): void => {
    modal.close();
    payment.reset();
    amountDraft.reset();
  };

  return {
    close,
    closeAndReload: () => {
      close();
      reload();
    },
  };
}

export function useCredit() {
  const storeCredit = useStoreCredit();
  const modal = useCreditModal();
  const payment = usePaymentDraft(storeCredit.balance);
  const amountDraft = useAmountDraft();

  const { close, closeAndReload } = buildDismiss(
    modal,
    payment,
    amountDraft,
    storeCredit.reload,
  );

  const edit = buildEditController({
    entry: modal.entry,
    openSessionStoreId: storeCredit.sessionStoreId ?? null,
    draft: amountDraft,
    showForm: modal.openEdit,
    afterWrite: closeAndReload,
  });

  return {
    entries: storeCredit.entries,
    balance: storeCredit.balance,
    remainingByEntryId: storeCredit.remainingByEntryId,
    reload: storeCredit.reload,
    modal: { ...modal, close, openEdit: edit.open },
    payment: buildPaymentController(
      payment,
      storeCredit.sessionStoreId,
      closeAndReload,
    ),
    edit,
  };
}

export type CreditController = ReturnType<typeof useCredit>;
