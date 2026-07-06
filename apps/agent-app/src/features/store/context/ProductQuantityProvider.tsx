import { createContext, type ReactNode } from "react";
import { useAdderModal } from "../hooks/useAdderModal";

export interface ProductQuantityContextValue {
  adderModal: ReturnType<typeof useAdderModal>;
}

export const ProductQuantityContext = createContext<
  ProductQuantityContextValue | undefined
>(undefined);

export function ProductQuantityProvider({ children }: { children: ReactNode }) {
  const adderModal = useAdderModal();
  return (
    <ProductQuantityContext.Provider value={{ adderModal }}>
      {children}
    </ProductQuantityContext.Provider>
  );
}
