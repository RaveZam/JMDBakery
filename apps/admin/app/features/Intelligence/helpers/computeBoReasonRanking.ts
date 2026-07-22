import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type BoReasonRow = {
  reason: string;
  bo: number;
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

/** Ranks bad order reasons by units lost, worst first. */
export function computeBoReasonRanking(records: SalesRecord[]): BoReasonRow[] {
  const totals = new Map<string, number>();

  for (const record of records) {
    if (record.boQty <= 0 || !record.boReason?.trim()) continue;
    const reason = normalizeReason(record.boReason);
    totals.set(reason, (totals.get(reason) ?? 0) + record.boQty);
  }

  const totalBo = Array.from(totals.values()).reduce(
    (sum, bo) => sum + bo,
    0,
  );

  return Array.from(totals.entries())
    .map(([reason, bo]) => ({
      reason,
      bo,
      sharePct: totalBo === 0 ? 0 : (bo / totalBo) * 100,
    }))
    .sort((a, b) => b.bo - a.bo)
    .slice(0, 5);
}
