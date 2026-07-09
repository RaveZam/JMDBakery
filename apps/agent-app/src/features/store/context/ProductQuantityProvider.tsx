import { createContext, type ReactNode } from "react";
import { useStoreSales } from "../hooks/useStoreSales";

export interface ProductQuantityContextValue {
  adderModal: ReturnType<typeof useStoreSales>;
}

export const ProductQuantityContext = createContext<
  ProductQuantityContextValue | undefined
>(undefined);

export function ProductQuantityProvider({ children }: { children: ReactNode }) {
  const adderModal = useStoreSales();
  return (
    <ProductQuantityContext.Provider value={{ adderModal }}>
      {children}
    </ProductQuantityContext.Provider>
  );
}
