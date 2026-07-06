import { useEffect, useState } from "react";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import type { Product } from "../types/store-types";
import { useLocalSearchParams } from "expo-router";
import { useProductSalesCounts } from "./useProductSalesCounts";

export function useAdderModal() {
  const { sessionId, sessionStoreId } = useLocalSearchParams<{
    sessionId?: string;
    sessionStoreId?: string;
  }>();
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [remaining, setRemaining] = useState<Record<string, number>>({});
  const { salesCounts } = useProductSalesCounts(sessionStoreId ?? "");

  useEffect(() => {
    if (!sessionStoreId || !sessionId) return;

    const priceById = new Map(
      ProductsDao.getAllProducts().map((p) => [p.id, p.price]),
    );
    const items = SessionInventoryDao.getBySessionId(sessionId);

    setProducts(
      items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: priceById.get(item.productId) ?? 0,
      })),
    );
    setRemaining(
      Object.fromEntries(
        items.map((item) => [
          item.productId,
          item.qty - (salesCounts[item.productId]?.sold ?? 0),
        ]),
      ),
    );
  }, [visible, sessionId, sessionStoreId, salesCounts]);

  return {
    inventory: {
      salesCounts,
      remaining,
      visible,
      products,
      open: () => setVisible(true),
      close: () => setVisible(false),
    },
  };
}
