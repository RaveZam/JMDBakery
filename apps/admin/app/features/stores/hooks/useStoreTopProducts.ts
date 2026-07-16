import { useEffect, useState } from "react";

import { getStoreTopProducts } from "../services/storesService";
import { mergeTopProducts } from "../helpers/storeHelpers";
import type { TopProduct } from "../types/store-types";

type TopProductsState = {
  products: TopProduct[];
  loading: boolean;
  error: string | null;
};

const EMPTY_STATE: TopProductsState = {
  products: [],
  loading: false,
  error: null,
};

export function useStoreTopProducts(storeIds: string[]): TopProductsState {
  const [state, setState] = useState<TopProductsState>(EMPTY_STATE);

  useEffect(() => {
    if (storeIds.length === 0) return;

    let cancelled = false;
    setState({ products: [], loading: true, error: null });

    Promise.all(storeIds.map((id) => getStoreTopProducts(id)))
      .then((results) => {
        const products = mergeTopProducts(results);
        if (!cancelled) setState({ products, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load top products";
          setState({ products: [], loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storeIds]);

  return storeIds.length > 0 ? state : EMPTY_STATE;
}
