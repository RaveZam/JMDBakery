import { useState } from "react";

/**
 * The Records page's active date-range filter.
 *
 * Kept separate from the rest of the field filters (view/search/province/
 * agent/product in useRecordsFieldFilters) because RecordsClient needs its
 * value before the dataset exists -- the range also drives the server-side
 * fetch, not just client-side filtering.
 */
export function useRecordsDateRange() {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  return { dateStart, setDateStart, dateEnd, setDateEnd };
}
