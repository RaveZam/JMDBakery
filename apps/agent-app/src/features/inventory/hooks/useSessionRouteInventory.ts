import { useCallback, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import SessionInventoryDao, {
  type InventoryItem,
} from "@/src/lib/dao/session-inventory-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import {
  addMorningInventoryItem,
  updateMorningInventoryQty,
  removeMorningInventoryItem,
} from "../services/session-inventory-save-service";
import { useProducts } from "./useProducts";

export type { InventoryItem };

export function useSessionRouteInventory() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { products } = useProducts();

  const [items, setItems] = useState<InventoryItem[]>(() =>
    sessionId ? SessionInventoryDao.getBySessionId(sessionId) : [],
  );

  const refresh = useCallback(() => {
    if (!sessionId) return;
    setItems(SessionInventoryDao.getBySessionId(sessionId));
  }, [sessionId]);

  const setItemQty = useCallback(
    (productId: string, qty: number) => {
      if (!sessionId || qty <= 0) return;
      const existing = items.find((it) => it.productId === productId);
      if (existing) {
        updateMorningInventoryQty(existing.inventoryId, qty);
      } else {
        const product = products.find((p) => p.id === productId);
        if (!product) return;
        addMorningInventoryItem({
          sessionId,
          productId,
          productName: product.name,
          qty,
        });
      }
      refresh();
    },
    [sessionId, items, products, refresh],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const item = items.find((it) => it.productId === productId);
      if (!item) return;
      removeMorningInventoryItem(item.inventoryId);
      refresh();
    },
    [items, refresh],
  );

  const finishInventory = useCallback((): boolean => {
    if (!sessionId || items.length === 0) return false;
    RouteSessionsDao.markInventoryFinished(sessionId);
    return true;
  }, [sessionId, items.length]);

  return {
    session: {
      id: sessionId ?? null,
      items,
      refresh,
      setItemQty,
      removeItem,
      finishInventory,
    },
  };
}
