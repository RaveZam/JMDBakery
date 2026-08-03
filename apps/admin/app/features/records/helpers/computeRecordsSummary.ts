import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type RecordsStats = {
  totalRecords: number;
  totalSoldQty: number;
  totalBoQty: number;
  boRate: number;
  cashTotal: number;
  creditTotal: number;
};

export function computeRecordsSummary(records: SalesRecord[]): RecordsStats {
  const totalSoldQty = records.reduce((sum, r) => sum + r.soldQty, 0);
  const totalBoQty = records.reduce((sum, r) => sum + r.boQty, 0);
  const totalUnits = totalSoldQty + totalBoQty;
  const cashTotal = records
    .filter((r) => r.paymentType === "cash")
    .reduce((sum, r) => sum + r.total, 0);
  const creditTotal = records
    .filter((r) => r.paymentType === "credit")
    .reduce((sum, r) => sum + r.total, 0);

  return {
    totalRecords: records.length,
    totalSoldQty,
    totalBoQty,
    boRate: totalUnits > 0 ? (totalBoQty / totalUnits) * 100 : 0,
    cashTotal,
    creditTotal,
  };
}
