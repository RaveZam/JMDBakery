import type { ReactElement } from "react";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";

export function RecordBadOrderReason({ record }: { record: SalesRecord }): ReactElement | null {
  if (record.boQty <= 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-destructive">
        Reason for bad order
      </p>
      <p className="mt-1 text-sm">{record.boReason ?? "No reason recorded"}</p>
    </div>
  );
}
