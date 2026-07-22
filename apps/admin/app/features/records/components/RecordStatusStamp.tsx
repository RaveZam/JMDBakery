import type { ReactElement } from "react";

import type { RecordStatus } from "../helpers/recordStatus";

const STAMP_LABEL: Record<RecordStatus, string> = {
  sale: "Sold",
  "bad-order": "Bad order",
  split: "Split",
  none: "No activity",
};

const STAMP_STYLE: Record<RecordStatus, string> = {
  sale: "border-primary text-primary",
  "bad-order": "border-destructive text-destructive",
  split: "border-gold text-gold",
  none: "border-muted-foreground/40 text-muted-foreground",
};

export function RecordStatusStamp({ status }: { status: RecordStatus }): ReactElement {
  return (
    <span
      className={`stamp-press inline-flex -rotate-6 items-center rounded-md border-2 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-widest ${STAMP_STYLE[status]}`}
    >
      {STAMP_LABEL[status]}
    </span>
  );
}
