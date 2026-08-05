export type StockCheckInput = {
  quantity: number;
  boQty: number;
  remaining: number;
  editingOriginal?: { quantity: number; boQty: number };
};

/**
 * validates the input if there is enough amount to complete the log.
 *
 * @params input : StockCheckInput
 *  quantity: number;
 *  boQty: number;
 *  remaining: number;
 *  editingOriginal?: { quantity: number; boQty: number };
 *
 *
 *   combines the sold quantity + bo quantity, available is derived from remaining + the original amount that was sold (if its in editing mode)
 *   returns true if the requested amount is less than or equal to the available amount meaning there is enough stock to complete the log
 *
 *   @returns boolean (true if there is enough stock to complete the log)
 *
 */

export function hasEnoughStock(input: StockCheckInput): boolean {
  const requested = input.quantity + input.boQty;
  const available =
    input.remaining +
    (input.editingOriginal
      ? input.editingOriginal.quantity + input.editingOriginal.boQty
      : 0);
  return requested <= available;
}
