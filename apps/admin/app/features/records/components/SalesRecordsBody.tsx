"use client";

import type { useRecordsFilter } from "../hooks/useRecordsFilter";
import { RecordsTable } from "./RecordsTable";
import { RecordsPagination } from "./RecordsPagination";

export function SalesRecordsBody({
  filter,
}: {
  filter: ReturnType<typeof useRecordsFilter>;
}) {
  return (
    <>
      <RecordsTable records={filter.pageRecords} />
      <RecordsPagination
        page={filter.page}
        totalPages={filter.totalPages}
        totalRecords={filter.records.length}
        onPageChange={filter.setPage}
      />
    </>
  );
}
