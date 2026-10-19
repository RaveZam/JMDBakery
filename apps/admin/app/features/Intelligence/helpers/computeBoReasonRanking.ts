import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type BoReasonRow = {
  reason: string;
  bo: number;
  boAmount: number;
  sharePct: number;
};

const PRESET_REASONS = ["Rotten", "Damaged", "Lost"] as const;

function normalizeReason(rawReason: string): string {
  const trimmed = rawReason.trim();
  const preset = PRESET_REASONS.find(
    (presetReason) => presetReason.toLowerCase() === trimmed.toLowerCase(),
  );
  return preset ?? trimmed;
}

/** Ranks every bad order reason by units lost, worst first. */
export function computeBoReasonRanking(records: SalesRecord[]): BoReasonRow[] {
  const totals = new Map<string, { bo: number; boAmount: number }>();

  for (const record of records) {
    if (record.boQty <= 0 || !record.boReason?.trim()) continue;
    const reason = normalizeReason(record.boReason);
    const reasonTotals = totals.get(reason) ?? { bo: 0, boAmount: 0 };
    reasonTotals.bo += record.boQty;
    reasonTotals.boAmount += record.boQty * record.unitPrice;
    totals.set(reason, reasonTotals);
  }

  const totalBo = Array.from(totals.values()).reduce(
    (sum, reasonTotals) => sum + reasonTotals.bo,
    0,
  );

  return Array.from(totals.entries())
    .map(([reason, { bo, boAmount }]) => ({
      reason,
      bo,
      boAmount,
      sharePct: totalBo === 0 ? 0 : (bo / totalBo) * 100,
    }))
    .sort((a, b) => b.bo - a.bo);
}
