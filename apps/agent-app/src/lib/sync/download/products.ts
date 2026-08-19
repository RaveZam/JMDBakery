import { supabase } from "@/src/lib/supabase";
import { ProductsDao } from "@/src/lib/dao/products-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { latestUpdatedAt } from "../latest-updated-at";

/**
 * Incremental pull of `products`. Asks the server only for rows newer than the
 * cursor in `sync_state`, so a run that finds nothing new costs one empty
 * query. A row carrying `deleted_at` is removed locally instead of upserted.
 * The cursor advances to the newest `updated_at` in the batch — an empty or
 * failed fetch leaves it alone so the window is retried.
 */
export async function downloadProducts(): Promise<void> {
  const lastSynced = SyncStateDao.getLastSyncedAt("products");
  let query = supabase
    .from("products")
    .select("id, product_name, product_price, deleted_at, updated_at");

  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;

  if (error || !data) {
    console.warn("[download] failed to fetch products:", error?.message);
    return;
  }

  for (const product of data) {
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

  const newLastUpdatedAt = latestUpdatedAt(data);
  if (newLastUpdatedAt)
    SyncStateDao.setLastSyncedAt("products", newLastUpdatedAt);
}
