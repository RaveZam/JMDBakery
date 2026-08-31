import { useEffect, useState } from "react";

import { getStoreCreditEntries } from "../services/getStoreCreditEntries";
import type { CreditLedgerEntry } from "../types/store-types";

type CreditState = {
  entries: CreditLedgerEntry[];
  loading: boolean;
  error: string | null;
};

const EMPTY_STATE: CreditState = {
  entries: [],
  loading: false,
  error: null,
};

/**
 * Fetches a single store's full credit ledger. Uncached — the modal's
 * Credit tab is opened rarely enough that a fresh read each time is fine.
 */
export function useCredit(storeId: string): CreditState {
  const [state, setState] = useState<CreditState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;
    setState({ entries: [], loading: true, error: null });

    getStoreCreditEntries(storeId)
      .then((entries) => {
        if (!cancelled) setState({ entries, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load credit entries";
          setState({ entries: [], loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return state;
}
