import type { ReactElement } from "react";

import { getProducts } from "./services/productsService";
import { ProductsClient } from "./components/ProductsClient";

export async function ProductPage(): Promise<ReactElement> {
  const products = await getProducts();
  return <ProductsClient products={products} />;
}

export default ProductPage;
