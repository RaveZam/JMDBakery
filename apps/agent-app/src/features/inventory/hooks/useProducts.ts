import { useEffect, useState } from "react";

import { getAllProducts, refreshProducts } from "../services/products-service";

type Product = { id: string; name: string; price: number };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => getAllProducts());

  useEffect(() => {
    let isMounted = true;
    refreshProducts().then((freshProducts) => {
      if (isMounted) setProducts(freshProducts);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return { products };
}
