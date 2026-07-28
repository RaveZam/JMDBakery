"use server";

import { createClient } from "@/utils/supabase/server";
import type { PriceModifier, PriceModifierInput } from "../types/product-types";

const DUPLICATE_KEYWORD_ERROR = "This keyword already exists for this product.";

// Rewrites a raw Postgres error into a message a form can show, when it's the
// unique-constraint violation (23505) on (product_id, province_keyword).
function toDuplicateFriendlyError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") {
    return new Error(DUPLICATE_KEYWORD_ERROR);
  }
  return new Error(error.message);
}

// Converts a raw province_price_modifiers row (snake_case DB shape) into the
// domain PriceModifier type (camelCase) so callers never see the DB shape.
function mapRow(row: {
  id: string;
  product_id: string;
  province_keyword: string;
  price_modifier: number | string;
}): PriceModifier {
  return {
    id: row.id,
    productId: row.product_id,
    keyword: row.province_keyword,
    //price_modifier can come back as a numeric string depending on the PG driver, so coerce it
    modifier: Number(row.price_modifier),
  };
}

/**
 * Fetches all price modifiers configured for a product, oldest first.
 *
 * @param productId - The product's id. Modifiers belonging to other products are excluded.
 * @returns Array of PriceModifier, ordered by creation time ascending. Empty array if
 *          the product has no modifiers.
 * @throws Error with the raw Supabase message if the query fails.
 */
export async function getPriceModifiers(
  productId: string,
): Promise<PriceModifier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("province_price_modifiers")
    .select("id, product_id, province_keyword, price_modifier")
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapRow);
}

/**
 * Creates a new price modifier for a product and persists it to Supabase.
 *
 * @param productId - The product the modifier applies to.
 * @param input - The keyword (matched against a store's province) and the price
 *                modifier amount to apply.
 * @returns The newly created PriceModifier, including its generated id.
 * @throws Error with a friendly message ("This keyword already exists for this
 *         product.") if the (productId, keyword) pair already exists; otherwise
 *         the raw Supabase error message.
 */
export async function addPriceModifier(
  productId: string,
  input: PriceModifierInput,
): Promise<PriceModifier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("province_price_modifiers")
    .insert({
      product_id: productId,
      province_keyword: input.keyword,
      price_modifier: input.modifier,
    })
    .select("id, product_id, province_keyword, price_modifier")
    .single();

  if (error) throw toDuplicateFriendlyError(error);

  return mapRow(data);
}

/**
 * Overwrites the keyword and modifier amount of an existing price modifier.
 *
 * @param id - The price modifier's own id (not the product id).
 * @param input - The replacement keyword and modifier amount.
 * @throws Error with a friendly duplicate-keyword message if the new keyword
 *         collides with another modifier on the same product; otherwise the raw
 *         Supabase error message.
 */
export async function updatePriceModifier(
  id: string,
  input: PriceModifierInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("province_price_modifiers")
    .update({
      province_keyword: input.keyword,
      price_modifier: input.modifier,
    })
    .eq("id", id);

  if (error) throw toDuplicateFriendlyError(error);
}

/**
 * Soft-deletes a price modifier by stamping deleted_at. The row stays in the
 * table so the agent app's incremental pull (which fetches rows by updated_at)
 * can see the deletion and drop its local copy. Every read here filters
 * deleted_at, so a soft-deleted modifier is invisible to callers, and the
 * keyword uniqueness index ignores it — the same keyword can be re-added.
 *
 * @param id - The price modifier's own id.
 * @throws Error with the raw Supabase message if the update fails.
 */
export async function deletePriceModifier(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("province_price_modifiers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
