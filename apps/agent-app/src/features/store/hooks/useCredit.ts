import { Alert } from "react-native";

import {
  deleteCreditEntry,
  recordStorePayment,
  updateCreditEntryAmount,
} from "../services/store-credit-service";
import { canModifyCreditEntry } from "../core/can-modify-credit-entry";
import { getCurrentUserId } from "@/src/lib/current-user";
import { useCreditModal } from "./useCreditModal";
import { useStoreCredit } from "./useStoreCredit";
import type { CreditEntry } from "../types/store-types";

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

// Whether the open entry is one this agent may edit or delete. Nothing is open
// means nothing to modify.
function isOwnEntry(
  entry: CreditEntry | null,
  sessionStoreId: string | null,
): boolean {
  return (
    entry !== null &&
    canModifyCreditEntry(entry, getCurrentUserId(), sessionStoreId)
  );
}

/**
 * The store's credit ledger and the modal over it: the balance, the history,
 * and the three writes the modal can make — record a payment, correct an
 * amount, delete a row. Every write closes the modal and re-reads the entries,
 * so the balance and the tab badge follow immediately.
 */
export function useCredit() {
  const storeCredit = useStoreCredit();
  const modal = useCreditModal(storeCredit.balance);

  function closeAndReload(): void {
    modal.close();
    storeCredit.reload();
  }

  function record(): void {
    const { sessionStoreId } = storeCredit;
    if (modal.draftAmount <= 0 || !sessionStoreId) return;
    recordStorePayment({ sessionStoreId, amount: modal.draftAmount });
    closeAndReload();
  }

  function save(): void {
    if (!modal.entry || modal.draftAmount <= 0) return;
    updateCreditEntryAmount(modal.entry.id, modal.draftAmount);
    closeAndReload();
  }

  function remove(): void {
    if (!modal.entry) return;
    confirmRemove(modal.entry, closeAndReload);
  }

  return {
    ...storeCredit,
    ...modal,
    canModify: isOwnEntry(modal.entry, storeCredit.sessionStoreId ?? null),
    record,
    save,
    remove,
  };
}

export type CreditController = ReturnType<typeof useCredit>;
