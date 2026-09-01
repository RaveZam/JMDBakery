/**
 * Drops credit sale lines, leaving the ones that were paid for on the spot.
 *
 * Use this for money figures only. A credit line is goods handed over without
 * payment, so counting it as revenue when it happens overstates what the
 * business took in — the money shows up later, as a repayment in the credit
 * ledger. Unit figures (pieces sold, bad orders) must NOT use this: those
 * pieces physically left the truck either way.
 *
 * @param records - Any rows carrying a `paymentType`, so this works on the
 *                  narrow record shapes the dashboard helpers take as well as
 *                  on full `SalesRecord` rows.
 * @returns A new array holding only the cash rows; the input is untouched.
 */
export function excludeCreditSales<
  T extends { paymentType: "cash" | "credit" },
>(records: T[]): T[] {
  return records.filter((record) => record.paymentType !== "credit");
}
