import { useEffect, useState } from "react";

import { getSalesBySessionStore } from "../services/sales-services";
import {
  countSoldByProduct,
  type ProductSalesCount,
} from "../core/count-sold-by-product";

export function useProductSalesCounts(sessionStoreId: string) {
  const [salesCounts, setSalesCounts] = useState<
    Record<string, ProductSalesCount>
  >({});

  useEffect(() => {
    if (!sessionStoreId) return;
    setSalesCounts(countSoldByProduct(getSalesBySessionStore(sessionStoreId)));
  }, [sessionStoreId]);

  return { salesCounts };
}
