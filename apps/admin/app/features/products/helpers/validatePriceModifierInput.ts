import type { PriceModifierInput } from "../types/product-types";

/**
 * Validates and parses the raw text-field values for a price modifier form.
 *
 * @param keyword - Raw keyword input; leading/trailing whitespace is trimmed
 *                   before validation.
 * @param modifier - Raw modifier input as typed (e.g. "-1", "2.5"); coerced to
 *                    a number.
 * @returns `{ input: PriceModifierInput }` with the trimmed keyword and parsed
 *          number on success, or `{ error: string }` with a message to show
 *          the user on failure. Never throws.
 */
export function validatePriceModifierInput(
  keyword: string,
  modifier: string,
): { input: PriceModifierInput } | { error: string } {
  const trimmedKeyword = keyword.trim();
  const parsedModifier = Number(modifier);

  if (!trimmedKeyword) {
    return { error: "Keyword is required." };
  }

  //Number("") is 0 (finite), so this only catches genuinely non-numeric text like "abc"
  if (!Number.isFinite(parsedModifier)) {
    return { error: "Modifier must be a number." };
  }

  return { input: { keyword: trimmedKeyword, modifier: parsedModifier } };
}
