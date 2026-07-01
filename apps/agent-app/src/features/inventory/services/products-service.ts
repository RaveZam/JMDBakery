import { ProductsDao } from "@/src/lib/dao/products-dao";

export function getAllProducts() {
  return ProductsDao.getAllProducts();
}
