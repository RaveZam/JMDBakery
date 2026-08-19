import { supabase } from "@/src/lib/supabase";
import { ProvincePriceModifiersDao } from "@/src/lib/dao/province-price-modifiers-dao";
import { SyncStateDao } from "@/src/lib/dao/sync-state-dao";
import { latestUpdatedAt } from "../latest-updated-at";

/**
 * Incremental pull of `province_price_modifiers`, same cursor rules as
 * products: only rows newer than `sync_state`, soft deletes remove locally,
 * and the cursor moves to the newest `updated_at` in the batch.
 */
export async function downloadProvincePriceModifiers(): Promise<void> {
  const lastSynced = SyncStateDao.getLastSyncedAt("province_price_modifiers");
  let query = supabase
    .from("province_price_modifiers")
    .select(
      "id, product_id, province_keyword, price_modifier, deleted_at, updated_at",
    );
  if (lastSynced) query = query.gte("updated_at", lastSynced);

  const { data, error } = await query;
  if (error || !data) {
    console.warn(
      "[download] failed to fetch province price modifiers:",
      error?.message,
    );
    return;
  }

  for (const modifier of data) {
    if (modifier.deleted_at) {
      ProvincePriceModifiersDao.deleteProvincePriceModifier(modifier.id);
      continue;
    }
    ProvincePriceModifiersDao.upsertProvincePriceModifier(
      modifier.id,
      modifier.product_id,
      modifier.province_keyword,
      modifier.price_modifier,
    );
  }

  const newCursor = latestUpdatedAt(data);
  if (newCursor)
    SyncStateDao.setLastSyncedAt("province_price_modifiers", newCursor);
}
