import StorePageContent from "./StorePageContent";
import { ProductQuantityProvider } from "../context/ProductQuantityProvider";

export default function StorePage() {
  return (
    <ProductQuantityProvider>
      <StorePageContent />
    </ProductQuantityProvider>
  );
}
