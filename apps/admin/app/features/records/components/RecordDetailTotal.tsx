import type { ReactElement } from "react";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import { DetailTotalRow } from "@/components/DetailTotalRow";
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
    <DetailTotalRow value={formatCurrencyPHP(record.total)} colorClass={TOTAL_STYLE[status]} />
  );
}
