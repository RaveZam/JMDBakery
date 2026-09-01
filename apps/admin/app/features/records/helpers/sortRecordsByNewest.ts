import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { manilaTimestamp } from "@/lib/manilaTimestamp";

function sortKey(record: SalesRecord): string {
  return manilaTimestamp.sortKey(record.createdAt) || record.date;
}

/**
 * Orders sales rows newest first.
 *
 * Sorts on each sale's own timestamp rather than its session, so an order
 * logged today into a route started yesterday lands at the top instead of
 * buried in yesterday's block. Rows with no timestamp fall back to their date.
 *
 * @param records - Rows for the open Records view.
 * @returns A new array, newest first; the input is untouched.
 */
export function sortRecordsByNewest(records: SalesRecord[]): SalesRecord[] {
  return [...records].sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
}
