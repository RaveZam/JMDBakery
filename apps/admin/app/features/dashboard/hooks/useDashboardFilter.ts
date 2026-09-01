import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { VarianceRecord } from "@/app/server/varianceData/getVarianceDataset";
import type { CreditPayment } from "@/app/features/records/types";
import { FilterRange } from "../types/dashboard-types";
import { getDateRange } from "../helpers/getDateRange";

export function useDashboardFilter(
  allData: SalesRecord[],
  allVarianceData: VarianceRecord[] = [],
  allPayments: CreditPayment[] = [],
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
  // A payment's date is already a Manila date key, same as a session date, so
  // it slots into the same range comparison.
  const payments = useMemo(
    () => allPayments.filter((p) => p.date >= rangeFrom && p.date <= rangeTo),
    [allPayments, rangeFrom, rangeTo],
  );

  return { filter, data, varianceData, payments, onFilterChange };
}
