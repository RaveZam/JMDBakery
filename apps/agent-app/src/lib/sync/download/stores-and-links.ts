import { supabase } from "@/src/lib/supabase";
import StoresDao from "@/src/lib/dao/store-dao";
import ProvinceStoresDao from "@/src/lib/dao/province-stores-dao";
import { toLocalStore } from "./core/to-local-store";

const STORE_COLUMNS =
  "id, store_name, province_id, province, city, barangay, contact_number, contact_name, created_by, created_by_name";

type ProvinceStoreLink = {
  id: string;
  province_id: string;
  store_id: string;
  created_at: string;
};

/**
 * Writes the province -> store links, skipping any the local DB rejects.
 * A store row missing locally (e.g. a partial prior sync) FK-fails its own
 * link; dropping just that one keeps the rest of the batch.
 */
function upsertLinksSkippingFkMisses(links: ProvinceStoreLink[]): void {
  for (const link of links) {
    try {
      // The server's created_at, not this device's clock — the link already
      // happened somewhere else and this is only a copy of it.
      ProvinceStoresDao.upsertLink(
        link.id,
        link.province_id,
        link.store_id,
        link.created_at,
      );
    } catch (linkError) {
      console.warn(
        `[download] failed to link store ${link.store_id} to province ${link.province_id}:`,
        linkError,
      );
    }
  }
}

/**
 * Pulls this agent's province_stores links (RLS scopes them to provinces the
 * agent owns through their routes), then the stores those links point at.
 *
 * Stores are fetched by id rather than pulling the whole table — every store
 * outside this agent's links is none of this device's business — and are
 * written before the links so the FK has something to land on.
 *
 * @returns How many stores landed, or null if either fetch failed.
 */
export async function downloadAgentStoresAndLinks(): Promise<number | null> {
  const { data: links, error } = await supabase
    .from("province_stores")
    .select("id, province_id, store_id, created_at");
  if (error || !links) {
    console.warn("[download] failed to fetch store links:", error?.message);
    return null;
  }

  // One store can be linked to several provinces; fetch it once.
  const storeIds = [...new Set(links.map((link) => link.store_id))];

  let storeCount = 0;
  if (storeIds.length > 0) {
    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select(STORE_COLUMNS)
      .in("id", storeIds);
    if (storesError || !stores) {
      console.warn("[download] failed to fetch stores:", storesError?.message);
      return null;
    }
    for (const row of stores) {
      StoresDao.upsertStore(toLocalStore(row));
    }
    storeCount = stores.length;
  }

  upsertLinksSkippingFkMisses(links);
  return storeCount;
}
