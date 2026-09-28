import { useCallback, useEffect, useState } from "react";

import { useResetOnChange } from "@/hooks/useResetOnChange";
import { getStoreSales } from "../services/getStoreSales";
import type { StoreSale } from "../types/store-types";

type SalesState = {
  sales: StoreSale[];
  totalCount: number;
  loading: boolean;
  error: string | null;
};

const EMPTY_STATE: SalesState = {
  sales: [],
  totalCount: 0,
  loading: false,
  error: null,
};

type StoreSalesState = SalesState & {
  page: number;
  goToPage: (page: number) => void;
};

export function useStoreSales(storeIds: string[]): StoreSalesState {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<SalesState>(EMPTY_STATE);

  // A different store's ids arriving while page 3 is still selected would ask
  // for an offset past that store's own last page, so the switch resets it.
  useResetOnChange(storeIds, () => setPage(1));

  useEffect(() => {
    if (storeIds.length === 0) return;

    let cancelled = false;
    setState({ sales: [], totalCount: 0, loading: true, error: null });

    getStoreSales(storeIds, page)
      .then(({ sales, totalCount }) => {
        if (!cancelled) setState({ sales, totalCount, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load sales";
        setState({ sales: [], totalCount: 0, loading: false, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [storeIds, page]);

  const goToPage = useCallback((next: number): void => setPage(next), []);

  return storeIds.length > 0
    ? { ...state, page, goToPage }
    : { ...EMPTY_STATE, page: 1, goToPage };
}
