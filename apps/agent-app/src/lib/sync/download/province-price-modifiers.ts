import { ProvincePriceModifiersDao } from "@/src/lib/dao/province-price-modifiers-dao";
import { pullIncremental } from "../pull-incremental";

type ProvincePriceModifierRow = {
  id: string;
  product_id: string;
  province_keyword: string;
  price_modifier: number;
  deleted_at: string | null;
  updated_at: string;
};

/**
 * Incremental pull of `province_price_modifiers`, same cursor rules as products:
 * only rows newer than `sync_state`, and soft deletes remove the local row.
 */
export async function downloadProvincePriceModifiers(): Promise<void> {
  await pullIncremental<ProvincePriceModifierRow>({
    tableName: "province_price_modifiers",
    columns:
      "id, product_id, province_keyword, price_modifier, deleted_at, updated_at",
    applyPage: (modifiers) => {
      for (const modifier of modifiers) {
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
    },
  });
}
