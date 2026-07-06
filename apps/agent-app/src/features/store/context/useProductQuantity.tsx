import { useContext } from "react";
import { ProductQuantityContext } from "./ProductQuantityProvider";

export function useProductQuantity() {
  const context = useContext(ProductQuantityContext);
  if (context === undefined) {
    throw new Error(
      "useProductQuantity must be used within a ProductQuantityProvider",
    );
  }
  return context;
}
