import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordView } from "../types";
import { searchRecords } from "./searchRecords";
import { filterRecordsByDateRange } from "./filterRecordsByDateRange";
import { sortRecordsByNewest } from "./sortRecordsByNewest";
import { matchesRecordView } from "./matchesRecordView";

export type RecordFilters = {
  view: RecordView;
  /** Raw search box text (store name). */
  search: string;
  /** Inclusive lower bound, "YYYY-MM-DD"; blank means no lower bound. */
  dateStart?: string;
  /** Inclusive upper bound, "YYYY-MM-DD"; blank means no upper bound. */
  dateEnd?: string;
  /** Raw province text filter; blank matches every province. */
  province?: string;
  /** Exact agent name from the agent dropdown; blank matches every agent. */
  agent?: string;
  /** Exact product name from the product dropdown; blank matches every product. */
  product?: string;
};

/**
 * Narrows the sales dataset down to the rows one Records view should list.
 *
 * @param records - Sales rows straight from `getSalesDataset`.
 * @param filters - The Records page's active view/search/date range/province/agent/product filters.
 * @returns A new array of rows for that view, newest first; the input is
 *   untouched.
 */
export function filterRecords(
  records: SalesRecord[],
  filters: RecordFilters,
): SalesRecord[] {
  const {
    view,
    search,
    dateStart = "",
    dateEnd = "",
    province = "",
    agent = "",
    product = "",
  } = filters;
  const provinceQuery = province.trim().toLowerCase();

  const inView = records.filter((record) => {
    if (!matchesRecordView(record, view)) return false;
    if (provinceQuery && !record.province.toLowerCase().includes(provinceQuery))
      return false;
    if (agent && record.agent !== agent) return false;
    if (product && record.product !== product) return false;

    return true;
  });

  return sortRecordsByNewest(
    filterRecordsByDateRange(searchRecords(inView, search), dateStart, dateEnd),
  );
}
