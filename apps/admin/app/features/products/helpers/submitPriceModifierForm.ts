import type { PriceModifierInput } from "../types/product-types";
import { validatePriceModifierInput } from "./validatePriceModifierInput";

/**
 * Validates a price-modifier form's raw field values and, if valid, hands the
 * parsed input off to the caller's save handler.
 *
 * @param keyword - Raw keyword field value.
 * @param modifier - Raw modifier field value.
 * @param handleUpdate - Called with the parsed `PriceModifierInput` when
 *                        validation succeeds. Not called on failure.
 * @param setError - Called with the validation error message on failure, or
 *                    with `null` to clear a previous error on success.
 * @sideEffects None of its own — all persistence happens inside `handleUpdate`,
 *              which this function does not await.
 */
export function submitPriceModifierForm(
  keyword: string,
  modifier: string,
  handleUpdate: (input: PriceModifierInput) => void,
  setError: (message: string | null) => void,
): void {
  const result = validatePriceModifierInput(keyword, modifier);
  if ("error" in result) {
    setError(result.error);
    return;
  }
  setError(null);
  handleUpdate(result.input);
}
