import { createContext, type ReactNode } from "react";
import { useStoreSales } from "../hooks/useStoreSales";
import { useStoreDetails } from "../hooks/useStoreDetails";

export interface ProductQuantityContextValue {
  adderModal: ReturnType<typeof useStoreSales>;
  storeDetails: ReturnType<typeof useStoreDetails>;
}

export const ProductQuantityContext = createContext<
  ProductQuantityContextValue | undefined
>(undefined);

export function ProductQuantityProvider({ children }: { children: ReactNode }) {
  const adderModal = useStoreSales();
  const storeDetails = useStoreDetails();
  return (
    <ProductQuantityContext.Provider value={{ adderModal, storeDetails }}>
      {children}
    </ProductQuantityContext.Provider>
  );
}
