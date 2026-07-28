import { getDb } from "@/src/lib/db";

export const ProvincePriceModifiersDao = {
  getAllProvincePriceModifiers() {
    return getDb().getAllSync<{
      id: string;
      product_id: string;
      province_keyword: string;
      price_modifier: number;
    }>(`SELECT * FROM province_price_modifiers`);
  },

  upsertProvincePriceModifier(
    id: string,
    productId: string,
    provinceKeyword: string,
    priceModifier: number,
  ) {
    getDb().runSync(
      `INSERT OR REPLACE INTO province_price_modifiers (id, product_id, province_keyword, price_modifier) VALUES (?, ?, ?, ?)`,
      [id, productId, provinceKeyword, priceModifier],
    );
  },

  /** Removes a modifier the server has deleted. Nothing references it. */
  deleteProvincePriceModifier(id: string): void {
    getDb().runSync(`DELETE FROM province_price_modifiers WHERE id = ?`, [id]);
  },
};
