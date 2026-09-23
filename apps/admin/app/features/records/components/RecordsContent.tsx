"use client";

import { RecordsToolbar } from "./RecordsToolbar";
import { RecordsViewBody } from "./RecordsViewBody";

export function RecordsContent() {
  return (
    // The page itself never scrolls: the summary and filter bar keep their
    // height and the table below takes whatever is left.
    <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
      <div className="mx-auto flex h-full w-full max-w-300 flex-col gap-6">
        <RecordsToolbar />
        <RecordsViewBody />
      </div>
    </div>
  );
}
