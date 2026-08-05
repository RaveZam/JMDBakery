import { createContext, useEffect, type ReactNode } from "react";
import { useStoreSales } from "../hooks/useStoreSales";
import { useStoreDetails } from "../hooks/useStoreDetails";
import { useCredit } from "../hooks/useCredit";

export interface ProductQuantityContextValue {
  sales: ReturnType<typeof useStoreSales>;
  storeDetails: ReturnType<typeof useStoreDetails>;
  credit: ReturnType<typeof useCredit>;
}

export const ProductQuantityContext = createContext<
  ProductQuantityContextValue | undefined
>(undefined);

export function ProductQuantityProvider({ children }: { children: ReactNode }) {
  const sales = useStoreSales();
  const storeDetails = useStoreDetails();
  const credit = useCredit();

  // What the store owes is derived from its credit orders, so any change to the
  // log — added, edited, deleted — moves the balance on the Credits tab. Neither
  // hook knows about the other; the provider holding both wires it, so neither
  // has to take the other as an argument.
  useEffect(() => {
    credit.reload();
  }, [sales.orders.items, credit.reload]);

  return (
    <ProductQuantityContext.Provider value={{ sales, storeDetails, credit }}>
      {children}
    </ProductQuantityContext.Provider>
  );
}
