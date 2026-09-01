import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordView } from "../types";
import { searchRecords } from "./searchRecords";
import { sortRecordsByNewest } from "./sortRecordsByNewest";

/**
 * Narrows the sales dataset down to the rows one Records view should list.
 *
 * All Records lists both payment types. Sales and Bad Orders are about money
 * that already came in, so they keep credit lines out; Credits shows only
 * them.
 *
 * @param records - Sales rows straight from `getSalesDataset`.
 * @param view - The tab currently selected on the Records page.
 * @param search - Raw search box text.
 * @returns A new array of rows for that view, newest first; the input is
 *   untouched.
 */
export function filterRecords(
  records: SalesRecord[],
  view: RecordView,
  search: string,
): SalesRecord[] {
  const inView = records.filter((record) => {
    const isCredit = record.paymentType === "credit";

    if (view === "credits") return isCredit;
    if (view !== "all" && isCredit) return false;
    if (view === "sales" && record.soldQty <= 0) return false;
    if (view === "bad-orders" && record.boQty <= 0) return false;

    return true;
  });

  return sortRecordsByNewest(searchRecords(inView, search));
}
