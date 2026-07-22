import type { ReactElement } from "react";
import { X } from "lucide-react";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { RecordStatus } from "../helpers/recordStatus";
import { RecordStatusStamp } from "./RecordStatusStamp";

export function RecordDetailHeader({
  record,
  status,
  onClose,
}: {
  record: SalesRecord;
  status: RecordStatus;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border px-5 py-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Distribution ticket
        </p>
        <h2 className="mt-0.5 text-base font-semibold">{record.store}</h2>
        <p className="text-xs text-muted-foreground">
          {record.province} &middot; {record.date}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          className="rounded-lg p-1 hover:bg-muted transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <RecordStatusStamp status={status} />
      </div>
    </div>
  );
}
