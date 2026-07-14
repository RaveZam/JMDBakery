import { useMemo, useState } from "react";
import type { SalesRecord } from "@/app/server/getBaseData";
import { paginateRecords } from "../helpers/paginateRecords";

export function usePagination(
  records: SalesRecord[],
  pageSize: number,
  resetKey: string,
) {
  const [page, setPage] = useState(1);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageRecords = useMemo(
    () => paginateRecords(records, currentPage, pageSize),
    [records, currentPage, pageSize],
  );

  return { page: currentPage, setPage, totalPages, pageRecords };
}
