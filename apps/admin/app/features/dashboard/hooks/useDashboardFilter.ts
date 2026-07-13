import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/getBaseData";
import { FilterRange } from "../types/dashboard-types";
import { getDateRange } from "../helpers/getDateRange";

export function useDashboardFilter(allData: SalesRecord[]) {
  const [filter, setFilter] = useState<FilterRange>("7days");

  function onFilterChange(newFilter: FilterRange) {
    setFilter(newFilter);
  }

  const { from: rangeFrom, to: rangeTo } = getDateRange(filter);
  const data = useMemo(
    () => allData.filter((r) => r.date >= rangeFrom && r.date <= rangeTo),
    [allData, rangeFrom, rangeTo],
  );

  return { filter, data, onFilterChange };
}
