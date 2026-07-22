import type { VarianceRecord } from "@/app/server/varianceData/getVarianceDataset";

export function computeVarianceTotal(data: VarianceRecord[]): number {
  return data.reduce((sum, r) => sum + Math.abs(r.variance), 0);
}
