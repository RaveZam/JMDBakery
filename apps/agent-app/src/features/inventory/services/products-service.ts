import { ProductsDao } from "@/src/lib/dao/products-dao";
import { isWifiConnected } from "@/src/lib/network";
import { downloadProducts } from "@/src/lib/sync/download";

export function getAllProducts() {
  return ProductsDao.getAllProducts();
}

/**
 * Pulls the newest products from Supabase, then returns the local list.
 *
 * Offline (or on a failed pull) this is a no-op that still returns whatever
 * is already in SQLite, so the caller always gets a usable product list.
 */
export async function refreshProducts() {
  if (await isWifiConnected()) {
    await downloadProducts();
  }
  return getAllProducts();
}
