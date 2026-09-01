import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export type RecordStatus = "sale" | "credit" | "bad-order" | "split" | "none";

export function recordStatus(record: SalesRecord): RecordStatus {
  if (record.soldQty > 0 && record.boQty > 0) return "split";
  if (record.boQty > 0) return "bad-order";
  // Goods went out but no cash came in yet, so it is not a sale yet.
  if (record.soldQty > 0) {
    return record.paymentType === "credit" ? "credit" : "sale";
  }
  return "none";
}
