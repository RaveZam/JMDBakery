import { useState } from "react";

import { useCreditDraft } from "./useCreditDraft";
import { useCreditEntryItems } from "./useCreditEntryItems";
import type { CreditEntry, CreditModalMode } from "../types/store-types";

/**
 * Which view of the modal is open and what it is open on. Closing drops the
 * draft, so a half-typed correction never reappears on the next entry opened.
 */
export function useCreditModal(outstandingBalance: number) {
  const [mode, setMode] = useState<CreditModalMode>(null);
  const [entry, setEntry] = useState<CreditEntry | null>(null);
  const draft = useCreditDraft(mode, outstandingBalance);
  const items = useCreditEntryItems(entry);

  function openEntry(selected: CreditEntry): void {
    setEntry(selected);
    setMode("entry");
  }

  function openEdit(): void {
    if (!entry) return;
    draft.seed(entry.amount);
    setMode("edit");
  }

  function close(): void {
    setMode(null);
    setEntry(null);
    draft.clear();
  }

  return {
    mode,
    entry,
    items,
    draftText: draft.text,
    draftAmount: draft.amount,
    setDraftText: draft.setText,
    payFull: () => draft.seed(Math.max(outstandingBalance, 0)),
    openEntry,
    openPayment: () => setMode("payment"),
    openEdit,
    close,
  };
}
