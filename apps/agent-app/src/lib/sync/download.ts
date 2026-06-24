import { supabase } from "@/src/lib/supabase";
import { isWifiConnected } from "@/src/lib/network";
import { ProductsDao } from "@/src/lib/dao/products-dao";

/**
 * Pulls server-owned reference data into the local DB. Runs once per signed-in
 * user (triggered from the auth flow). Extend here as more tables become
 * server-authoritative (routes, provinces, stores, prior sessions).
 */
export async function runDownloadSync(_userId?: string): Promise<void> {
  if (!(await isWifiConnected())) return;

  await downloadProducts();
}

async function downloadProducts(): Promise<void> {
  const { data, error } = await supabase.from("products").select("*");
  if (error || !data) {
    console.warn("[download] failed to fetch products:", error?.message);
    return;
  }

  for (const product of data) {
    ProductsDao.upsertProduct(
      product.id,
      product.product_name,
      product.product_price,
    );
  }
}
