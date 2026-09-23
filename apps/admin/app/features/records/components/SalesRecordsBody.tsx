"use client";

import { useRecordsFilters } from "../context/RecordsFiltersContext";
import { RecordsTable } from "./RecordsTable";
import { RecordsPagination } from "./RecordsPagination";

export function SalesRecordsBody() {
  const { records, pageRecords, pagination } = useRecordsFilters();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <RecordsTable records={pageRecords} />
      <RecordsPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalRecords={records.length}
        onPageChange={pagination.setPage}
      />
    </div>
  );
}
