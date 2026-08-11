"use client";

import type { useRecordsFilter } from "../hooks/useRecordsFilter";
import { RecordsSummary } from "./RecordsSummary";
import { RecordsFilterBar } from "./RecordsFilterBar";
import { RecordsViewBody } from "./RecordsViewBody";

export function RecordsContent({
  filter,
  showPayments,
}: {
  filter: ReturnType<typeof useRecordsFilter>;
  showPayments: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto w-full max-w-300 space-y-6">
        {/* The summary is about the sales dataset and stays put across tabs,
            so switching to Payments only swaps the table below. */}
        <RecordsSummary summary={filter.summary} />

        <RecordsFilterBar
          view={filter.view}
          onViewChange={filter.setView}
          search={filter.search}
          onSearchChange={filter.setSearch}
        />

        <RecordsViewBody showPayments={showPayments} filter={filter} />
      </div>
    </div>
  );
}
