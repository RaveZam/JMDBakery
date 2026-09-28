import type { ReactElement } from "react";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import { DetailRow } from "@/components/DetailRow";

export function RecordDetailFields({ record }: { record: SalesRecord }): ReactElement {
  return (
    <>
      <DetailRow label="Agent" value={record.agent} />
      <DetailRow label="Product" value={record.product} />
      <DetailRow
        label={record.paymentType === "credit" ? "Credit" : "Sold"}
        value={String(record.soldQty)}
      />
      <DetailRow label="Bad order" value={String(record.boQty)} />
      <DetailRow label="Unit price" value={formatCurrencyPHP(record.unitPrice)} />
    </>
  );
}
