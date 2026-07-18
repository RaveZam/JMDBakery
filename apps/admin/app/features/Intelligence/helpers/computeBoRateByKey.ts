import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type BoRateRow = {
  key: string;
  sold: number;
  bo: number;
  boRatePct: number;
};

/** Ranks records by bad order rate (bo / (sold + bo)), worst first. */
export function computeBoRateByKey(
  records: SalesRecord[],
  keyFn: (record: SalesRecord) => string,
): BoRateRow[] {
  const totals = new Map<string, { sold: number; bo: number }>();
  for (const record of records) {
    const key = keyFn(record);
    const groupTotals = totals.get(key) ?? { sold: 0, bo: 0 };
    groupTotals.sold += record.soldQty;
    groupTotals.bo += record.boQty;
    totals.set(key, groupTotals);
  }

  return Array.from(totals.entries())
    .map(([key, { sold, bo }]) => ({
      key,
      sold,
      bo,
      boRatePct: sold + bo === 0 ? 0 : (bo / (sold + bo)) * 100,
    }))
    .sort((a, b) => b.boRatePct - a.boRatePct)
    .slice(0, 5);
}
