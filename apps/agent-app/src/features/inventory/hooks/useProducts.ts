import { useEffect, useState } from "react";

import { getAllProducts } from "../services/products-service";

type Product = { id: string; name: string; price: number };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  return { products };
}
