import { useMemo } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordFilters } from "../helpers/filterRecords";
import { filterRecords } from "../helpers/filterRecords";
import { searchRecords } from "../helpers/searchRecords";
import { computeRecordsSummary } from "../helpers/computeRecordsSummary";

/**
 * Applies the Records page's active filters to the dataset.
 *
 * The summary describes the whole dataset, not the open tab, so it only
 * reacts to the search box and stays put as the user switches views.
 */
export function useFilteredRecords(
  allRecords: SalesRecord[],
  { view, search, dateStart, dateEnd, province, agent, product }: RecordFilters,
) {
  const records = useMemo(
    () =>
      filterRecords(allRecords, {
        view,
        search,
        dateStart,
        dateEnd,
        province,
        agent,
        product,
      }),
    [allRecords, view, search, dateStart, dateEnd, province, agent, product],
  );
  const summary = useMemo(
    () => computeRecordsSummary(searchRecords(allRecords, search)),
    [allRecords, search],
  );

  return { records, summary };
}
