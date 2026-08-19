import { isWifiConnected } from "@/src/lib/network";
import { downloadProducts } from "./products";
import { downloadProvincePriceModifiers } from "./province-price-modifiers";
import { downloadRoutes } from "./routes";
import { downloadProvinces } from "./provinces";
import { downloadAgentStoresAndLinks } from "./stores-and-links";
import { downloadSessions } from "./sessions";
import { downloadStoreCreditEntries } from "./store-credit/download-store-credit-entries";

/**
 * Pulls server-owned reference data into the local DB. Runs on sign-in and
 * whenever the app returns to the foreground. Does nothing off wifi.
 *
 * `products` and `province_price_modifiers` are incremental — each keeps its
 * own cursor in `sync_state`, so a run that finds nothing new costs one empty
 * query per table. The rest are a full pull each time (not yet incremental),
 * in FK-safe order: routes -> provinces -> stores + links -> sessions ->
 * store credit. Each step logs its own failures and does not stop the others.
 */
export async function runDownloadSync(): Promise<void> {
  if (!(await isWifiConnected())) return;

  await downloadProducts();
  await downloadProvincePriceModifiers();
  await downloadRoutes();
  await downloadProvinces();
  await downloadAgentStoresAndLinks();
  await downloadSessions();
  await downloadStoreCreditEntries();
}
