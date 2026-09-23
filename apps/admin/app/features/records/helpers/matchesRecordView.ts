import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordView } from "../types";

/**
 * Whether a sales row belongs to the given Records tab.
 *
 * All Records lists both payment types. Sales and Bad Orders are about money
 * that already came in, so they keep credit lines out; Credits shows only
 * them.
 */
export function matchesRecordView(
  record: SalesRecord,
  view: RecordView,
): boolean {
  const isCredit = record.paymentType === "credit";

  if (view === "credits") return isCredit;
  if (view !== "all" && isCredit) return false;
  if (view === "sales" && record.soldQty <= 0) return false;
  if (view === "bad-orders" && record.boQty <= 0) return false;

  return true;
}
