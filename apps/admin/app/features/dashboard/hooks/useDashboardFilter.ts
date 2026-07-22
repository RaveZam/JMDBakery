import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { VarianceRecord } from "@/app/server/varianceData/getVarianceDataset";
import { FilterRange } from "../types/dashboard-types";
import { getDateRange } from "../helpers/getDateRange";

export function useDashboardFilter(
  allData: SalesRecord[],
  allVarianceData: VarianceRecord[] = [],
) {
  const [filter, setFilter] = useState<FilterRange>("7days");

  function onFilterChange(newFilter: FilterRange) {
    setFilter(newFilter);
  }

  const { from: rangeFrom, to: rangeTo } = getDateRange(filter);
  const data = useMemo(
    () => allData.filter((r) => r.date >= rangeFrom && r.date <= rangeTo),
    [allData, rangeFrom, rangeTo],
  );
  const varianceData = useMemo(
    () =>
      allVarianceData.filter((r) => r.date >= rangeFrom && r.date <= rangeTo),
    [allVarianceData, rangeFrom, rangeTo],
  );

  return { filter, data, varianceData, onFilterChange };
}
