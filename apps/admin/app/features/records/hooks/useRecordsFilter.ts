import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/getBaseData";
import { RECORDS_PAGE_SIZE, type RecordView } from "../types";
import { filterRecords } from "../helpers/filterRecords";
import { computeRecordsSummary } from "../helpers/computeRecordsSummary";
import { usePagination } from "./usePagination";

export function useRecordsFilter(allRecords: SalesRecord[]) {
  const [view, setView] = useState<RecordView>("all");
  const [search, setSearch] = useState("");

  const records = useMemo(
    () => filterRecords(allRecords, view, search),
    [allRecords, view, search],
  );

  const summary = useMemo(() => computeRecordsSummary(records), [records]);
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
