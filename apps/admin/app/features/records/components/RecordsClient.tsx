"use client";

import { useSalesData } from "@/app/features/sales-data/SalesDataProvider";
import { useRecordsFilter } from "../hooks/useRecordsFilter";
import { RecordsHeader } from "./RecordsHeader";
import { RecordsSummary } from "./RecordsSummary";
import { RecordsFilterBar } from "./RecordsFilterBar";
import { RecordsTable } from "./RecordsTable";
import { RecordsPagination } from "./RecordsPagination";

export function RecordsClient() {
  const { data: allRecords } = useSalesData();
  const {
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
  } = useRecordsFilter(allRecords);

  return (
    <>
      <RecordsHeader />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-300 space-y-6">
          <RecordsSummary summary={summary} />
          <RecordsFilterBar
            view={view}
            onViewChange={setView}
            search={search}
            onSearchChange={setSearch}
          />
          <RecordsTable records={pageRecords} />
          <RecordsPagination
            page={page}
            totalPages={totalPages}
            totalRecords={records.length}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
