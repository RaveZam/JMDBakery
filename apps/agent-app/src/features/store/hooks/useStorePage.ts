import { useState, useMemo, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import { markStoreVisited } from "../services/visitLocalService";
import { useDistributionLog } from "./useDistributionLog";
import { computeSummary } from "../helpers/distribution-helpers";

export function useStorePage() {
  const params = useLocalSearchParams<{ sessionStoreId?: string }>();
  const sessionStoreId =
    typeof params.sessionStoreId === "string" ? params.sessionStoreId : null;

  const sessionStore = useMemo(
    () => (sessionStoreId ? SessionStoresDao.getById(sessionStoreId) : null),
    [sessionStoreId],
  );

  const storeName = sessionStore?.store_name ?? null;
  const location = [
    sessionStore?.store_barangay,
    sessionStore?.store_city,
    sessionStore?.province_name,
  ]
    .filter(Boolean)
    .join(", ");

  const products = useMemo(() => ProductsDao.getAllProducts(), []);
  const { loggedItems, logItem, updateItemQty, removeItem, editItem } =
    useDistributionLog(products, sessionStoreId);

  const [showSoldAdder, setShowSoldAdder] = useState(false);

  const soldItems = loggedItems.map((item, idx) => ({ item, idx }));
  const summary = computeSummary(loggedItems);

  const remainingByProduct = useMemo(
    () =>
      sessionStoreId
        ? SessionInventoryDao.getRemainingBySessionStoreId(sessionStoreId)
        : {},
    [sessionStoreId, loggedItems],
  );

  const confirmVisit = useCallback(() => {
    if (!sessionStoreId) return;
    markStoreVisited(sessionStoreId);
    router.back();
  }, [sessionStoreId]);

  return {
    storeName,
    location,
    products,
    loggedItems,
    logItem,
    updateItemQty,
    removeItem,
    editItem,
    soldItems,
    summary,
    remainingByProduct,
    showSoldAdder,
    setShowSoldAdder,
    confirmVisit,
  };
}
