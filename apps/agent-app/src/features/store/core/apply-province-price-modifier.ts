type ProvincePriceModifier = {
  product_id: string;
  province_keyword: string;
  price_modifier: number;
};

/**
 * Adjusts a product's base price for the store's province, if a price modifier
 * applies. A modifier applies when its product_id matches and its
 * province_keyword is a case-insensitive substring of storeProvince (e.g.
 * keyword "tuguegarao" matches storeProvince "Cagayan - Tuguegarao City").
 *
 * @param basePrice - The product's price before any province adjustment.
 * @param productId - The product being priced.
 * @param storeProvince - The session store's province text, or null.
 * @param modifiers - All synced province_price_modifiers rows.
 * @returns basePrice plus the first matching modifier's price_modifier, or
 *          basePrice unchanged if storeProvince is empty or nothing matches.
 */
export function applyProvincePriceModifier(
  basePrice: number,
  productId: string,
  storeProvince: string | null,
  modifiers: ProvincePriceModifier[],
): number {
  if (!storeProvince) return basePrice;

  const province = storeProvince.toLowerCase();

  const match = modifiers.find(
    (modifier) =>
      modifier.product_id === productId &&
      province.includes(modifier.province_keyword.toLowerCase()),
  );

  return match ? basePrice + match.price_modifier : basePrice;
}
