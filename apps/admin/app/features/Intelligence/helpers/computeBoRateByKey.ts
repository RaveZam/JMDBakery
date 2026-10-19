import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type BoRateRow = {
  key: string;
  sold: number;
  bo: number;
  boAmount: number;
  boRatePct: number;
};

/** Ranks every group by bad order rate (bo / (sold + bo)), worst first.
 * boAmount is the pesos lost: bad order units times their unit price. */
export function computeBoRateByKey(
  records: SalesRecord[],
  keyFn: (record: SalesRecord) => string,
): BoRateRow[] {
  const totals = new Map<
    string,
    { sold: number; bo: number; boAmount: number }
  >();
  for (const record of records) {
    const key = keyFn(record);
    const groupTotals = totals.get(key) ?? { sold: 0, bo: 0, boAmount: 0 };
    groupTotals.sold += record.soldQty;
    groupTotals.bo += record.boQty;
    groupTotals.boAmount += record.boQty * record.unitPrice;
    totals.set(key, groupTotals);
  }

  return Array.from(totals.entries())
    .map(([key, { sold, bo, boAmount }]) => ({
      key,
      sold,
      bo,
      boAmount,
      boRatePct: sold + bo === 0 ? 0 : (bo / (sold + bo)) * 100,
    }))
    .sort((a, b) => b.boRatePct - a.boRatePct);
}
