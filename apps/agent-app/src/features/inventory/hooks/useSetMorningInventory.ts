import { useCallback, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import type { Product } from "@/src/features/store/types/store-types";
import { addMorningInventoryItem } from "../services/session-inventory-save-service";
import { useProducts } from "./useProducts";

export function useSetMorningInventory() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { products } = useProducts();
  const [selected, setSelected] = useState<Product | undefined>();
  const [qty, setQty] = useState(1);

  const save = useCallback(() => {
    if (!selected || !sessionId || qty < 1) return;
    addMorningInventoryItem({
      sessionId,
      productId: selected.id,
      productName: selected.name,
      qty,
    });
    setSelected(undefined);
    setQty(1);
  }, [selected, sessionId, qty]);

  return {
    products: { products, selected, setSelected, qty, setQty, save },
  };
}
