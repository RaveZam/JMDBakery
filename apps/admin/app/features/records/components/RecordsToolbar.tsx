"use client";

import { RecordsSummary } from "./RecordsSummary";
import { RecordsFilterBar } from "./RecordsFilterBar";

/** Summary and filter bar above the records table. */
export function RecordsToolbar() {
  return (
    <>
      {/* The summary is about the sales dataset and stays put across tabs,
          so switching to Payments only swaps the table below. */}
      <RecordsSummary />
      <RecordsFilterBar />
    </>
  );
}
