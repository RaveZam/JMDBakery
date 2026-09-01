import type { ReactElement } from "react";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import type { RecordStatus } from "../helpers/recordStatus";

const TOTAL_STYLE: Record<RecordStatus, string> = {
  sale: "text-primary",
  credit: "text-credit",
  "bad-order": "text-destructive",
  split: "text-primary",
  none: "text-primary",
};

export function RecordDetailTotal({
  record,
  status,
}: {
  record: SalesRecord;
  status: RecordStatus;
}): ReactElement {
  return (
    <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-border pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
      <span className={`font-mono text-lg font-bold ${TOTAL_STYLE[status]}`}>
        {formatCurrencyPHP(record.total)}
      </span>
    </div>
  );
}
