import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { computeBoRateByKey } from "./computeBoRateByKey";

export function computeAgentBoRate(records: SalesRecord[]) {
  return computeBoRateByKey(records, (record) => record.agent);
}
