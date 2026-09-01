import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { RECORDS_PAGE_SIZE, type RecordView } from "../types";
import { filterRecords } from "../helpers/filterRecords";
import { searchRecords } from "../helpers/searchRecords";
import { computeRecordsSummary } from "../helpers/computeRecordsSummary";
import { usePagination } from "./usePagination";

export function useRecordsFilter(allRecords: SalesRecord[]) {
  const [view, setView] = useState<RecordView>("all");
  const [search, setSearch] = useState("");

  const records = useMemo(
    () => filterRecords(allRecords, view, search),
    [allRecords, view, search],
  );

  // The summary describes the whole dataset, not the open tab, so it stays
  // put as the user switches views.
  const summary = useMemo(
    () => computeRecordsSummary(searchRecords(allRecords, search)),
    [allRecords, search],
  );
  const { page, setPage, totalPages, pageRecords } = usePagination(
    records,
    RECORDS_PAGE_SIZE,
    `${view}:${search}`,
  );

  return {
    view,
    setView,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    records,
    pageRecords,
    summary,
  };
}
