import type { SalesRecord } from "@/app/server/getBaseData";

export type RecordsStats = {
  totalRecords: number;
  totalSoldQty: number;
  totalBoQty: number;
  boRate: number;
};

export function computeRecordsSummary(records: SalesRecord[]): RecordsStats {
  const totalSoldQty = records.reduce((sum, r) => sum + r.soldQty, 0);
  const totalBoQty = records.reduce((sum, r) => sum + r.boQty, 0);
  const totalUnits = totalSoldQty + totalBoQty;

  return {
    totalRecords: records.length,
    totalSoldQty,
    totalBoQty,
    boRate: totalUnits > 0 ? (totalBoQty / totalUnits) * 100 : 0,
  };
}
