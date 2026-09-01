import { useCallback, useEffect, useRef, useState } from "react";

import { getCreditEntrySales } from "../services/getCreditEntrySales";
import { getStoreCreditEntries } from "../services/getStoreCreditEntries";
import type {
  CreditEntrySale,
  CreditLedgerEntry,
} from "../types/store-types";

type LedgerState = {
  entries: CreditLedgerEntry[];
  loading: boolean;
  error: string | null;
};

type SalesState = {
  entry: CreditLedgerEntry | null;
  sales: CreditEntrySale[];
  loading: boolean;
  error: string | null;
};

type CreditState = LedgerState & {
  /** The entry whose orders are open, or null when the modal is closed. */
  selectedEntry: CreditLedgerEntry | null;
  sales: CreditEntrySale[];
  salesLoading: boolean;
  salesError: string | null;
  select: (entry: CreditLedgerEntry) => void;
  close: () => void;
};

const EMPTY_LEDGER: LedgerState = { entries: [], loading: false, error: null };

const NO_SELECTION: SalesState = {
  entry: null,
  sales: [],
  loading: false,
  error: null,
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function useLedger(storeId: string): LedgerState {
  const [state, setState] = useState<LedgerState>(EMPTY_LEDGER);

  useEffect(() => {
    let cancelled = false;
    setState({ entries: [], loading: true, error: null });

    getStoreCreditEntries(storeId)
      .then((entries) => {
        if (!cancelled) setState({ entries, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const error = errorMessage(err, "Failed to load credit entries");
        setState({ entries: [], loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return state;
}

/**
 * The orders behind whichever ledger row is open. Fetched on click rather than
 * in an effect, so opening a row is one render and one request.
 */
function useSelectedEntrySales(storeId: string): {
  selection: SalesState;
  select: (entry: CreditLedgerEntry) => void;
  close: () => void;
} {
  const [selection, setSelection] = useState<SalesState>(NO_SELECTION);

  // Two rows opened quickly can resolve out of order, which would leave the
  // modal showing the wrong entry's orders. Only the newest one may write.
  const openedEntryId = useRef<string | null>(null);

  const close = useCallback(() => {
    openedEntryId.current = null;
    setSelection(NO_SELECTION);
  }, []);

  // A store switch with a row still open would show the previous store's
  // orders, so the selection is dropped with the ledger it came from.
  useEffect(() => close, [storeId, close]);

  const select = useCallback(async (entry: CreditLedgerEntry) => {
    openedEntryId.current = entry.id;
    setSelection({ entry, sales: [], loading: true, error: null });

    try {
      const sales = await getCreditEntrySales(entry.id);
      if (openedEntryId.current !== entry.id) return;
      setSelection({ entry, sales, loading: false, error: null });
    } catch (err) {
      if (openedEntryId.current !== entry.id) return;
      const error = errorMessage(err, "Failed to load orders");
      setSelection({ entry, sales: [], loading: false, error });
    }
  }, []);

  return { selection, select: (entry) => void select(entry), close };
}

/**
 * Fetches a single store's full credit ledger, and the orders behind whichever
 * entry the admin opens. Uncached — the modal's Credit tab is opened rarely
 * enough that a fresh read each time is fine.
 */
export function useCredit(storeId: string): CreditState {
  const ledger = useLedger(storeId);
  const { selection, select, close } = useSelectedEntrySales(storeId);

  return {
    ...ledger,
    selectedEntry: selection.entry,
    sales: selection.sales,
    salesLoading: selection.loading,
    salesError: selection.error,
    select,
    close,
  };
}
