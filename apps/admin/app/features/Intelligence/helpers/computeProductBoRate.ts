import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { computeBoRateByKey } from "./computeBoRateByKey";

export function computeProductBoRate(records: SalesRecord[]) {
  return computeBoRateByKey(records, (record) => record.product);
}
