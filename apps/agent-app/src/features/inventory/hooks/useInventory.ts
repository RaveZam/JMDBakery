import { useCallback, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import SessionInventoryDao, {
  type InventoryItem,
} from "@/src/lib/dao/session-inventory-dao";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import {
  addMorningInventoryItem,
  updateMorningInventoryQty,
  removeMorningInventoryItem,
} from "../services/session-inventory-save-service";
import { cancelSession } from "@/src/features/sessions/services/sessionLocalService";
import { useProducts } from "./useProducts";
import type { Inventory } from "../types/inventory-types";

export function useInventory(): { inventory: Inventory } {
  const { sessionId, routeName } = useLocalSearchParams<{
    sessionId?: string;
    routeName?: string;
  }>();
  const { products } = useProducts();
  const [items, setItems] = useState<InventoryItem[]>(() =>
    sessionId ? SessionInventoryDao.getBySessionId(sessionId) : [],
  );

  const refreshInventory = useCallback(() => {
    if (!sessionId) return;
    setItems(SessionInventoryDao.getBySessionId(sessionId));
  }, [sessionId]);

  const adjustItemQty = useCallback(
    (productId: string, delta: number) => {
      if (!sessionId || delta === 0) return;
      const existing = items.find((it) => it.productId === productId);
      if (existing) {
        const nextQty = Math.max(0, existing.qty + delta);
        if (nextQty === 0) {
          removeMorningInventoryItem(existing.inventoryId);
        } else {
          updateMorningInventoryQty(existing.inventoryId, nextQty);
        }
        refreshInventory();
      } else if (delta > 0) {
        const product = products.find((p) => p.id === productId);
        if (!product) return;
        addMorningInventoryItem({
          sessionId,
          productId,
          productName: product.name,
          qty: delta,
        });
        refreshInventory();
      }
    },
    [sessionId, items, products, refreshInventory],
  );

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
      refreshInventory();
    },
    [sessionId, items, products, refreshInventory],
  );

  const removeItem = useCallback(
    (productId: string) => {
      const item = items.find((it) => it.productId === productId);
      if (!item) return;
      removeMorningInventoryItem(item.inventoryId);
      refreshInventory();
    },
    [items, refreshInventory],
  );

  const finishInventory = useCallback((): boolean => {
    if (!sessionId || items.length === 0) return false;
    RouteSessionsDao.markInventoryFinished(sessionId);
    return true;
  }, [sessionId, items.length]);

  function handleContinue() {
    if (!finishInventory()) return;
    router.replace({
      pathname: "/main/routes/session",
      params: { sessionId, routeName },
    });
  }

  const cancelInventorySession = useCallback(() => {
    if (!sessionId) return;
    cancelSession(sessionId);
    router.replace("/main/routes");
  }, [sessionId]);

  return {
    inventory: {
      id: sessionId ?? null,
      items,
      products,
      refreshInventory,
      adjustItemQty,
      setItemQty,
      removeItem,
      handleContinue,
      cancelInventorySession,
    },
  };
}
