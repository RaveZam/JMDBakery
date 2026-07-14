import type { SalesRecord } from "@/app/server/getBaseData";

export type RecordStatus = "sale" | "bad-order" | "split" | "none";

export function recordStatus(record: SalesRecord): RecordStatus {
  if (record.soldQty > 0 && record.boQty > 0) return "split";
  if (record.boQty > 0) return "bad-order";
  if (record.soldQty > 0) return "sale";
  return "none";
}
