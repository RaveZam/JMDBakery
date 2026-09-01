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
    // The page itself never scrolls: the summary and filter bar keep their
    // height and the table below takes whatever is left.
    <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
      <div className="mx-auto flex h-full w-full max-w-300 flex-col gap-6">
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
