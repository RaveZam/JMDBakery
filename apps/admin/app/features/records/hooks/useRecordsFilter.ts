import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { RECORDS_PAGE_SIZE } from "../types";
import { usePagination } from "./usePagination";
import { useRecordsFieldFilters } from "./useRecordsFieldFilters";
import { useFilteredRecords } from "./useFilteredRecords";

/**
 * Owns the Records page's view/search/province/agent/product filters and
 * derives the matching records, summary, and current page from them.
 *
 * dateStart/dateEnd are passed in rather than owned here -- they also drive
 * the server-side fetch one level up, in RecordsClient (see
 * useRecordsDateRange).
 */
export function useRecordsFilter(
  allRecords: SalesRecord[],
  dateStart: string,
  dateEnd: string,
) {
  const filters = useRecordsFieldFilters(allRecords);
  const { view, search, province, agent, product } = filters;

  const { records, summary } = useFilteredRecords(allRecords, {
    view,
    search,
    dateStart,
    dateEnd,
    province,
    agent,
    product,
  });
  const { page, setPage, totalPages, pageRecords } = usePagination(
    records,
    RECORDS_PAGE_SIZE,
    `${view}:${search}:${dateStart}:${dateEnd}:${province}:${agent}:${product}`,
  );

  return {
    filters,
    pagination: { page, setPage, totalPages },
    records,
    pageRecords,
    summary,
  };
}
