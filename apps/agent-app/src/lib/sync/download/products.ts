import { ProductsDao } from "@/src/lib/dao/products-dao";
import { pullIncremental } from "../pull-incremental";

type ProductRow = {
  id: string;
  product_name: string;
  product_price: number;
  deleted_at: string | null;
  updated_at: string;
};

/**
 * Incremental pull of `products`. Asks the server only for rows newer than the
 * cursor in `sync_state`, so a run that finds nothing new costs one empty query.
 * A row carrying `deleted_at` is removed locally instead of upserted.
 */
export async function downloadProducts(): Promise<void> {
  await pullIncremental<ProductRow>({
    tableName: "products",
    columns: "id, product_name, product_price, deleted_at, updated_at",
    applyPage: (products) => {
      for (const product of products) {
        if (product.deleted_at) {
          ProductsDao.deleteProduct(product.id);
          continue;
        }
        ProductsDao.upsertProduct(
          product.id,
          product.product_name,
          product.product_price,
        );
      }
    },
  });
}
