import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import { recordStatus, type RecordStatus } from "../helpers/recordStatus";

const STATUS_BAR: Record<RecordStatus, string> = {
  sale: "bg-primary",
  credit: "bg-credit",
  "bad-order": "bg-destructive",
  split: "bg-gold",
  none: "bg-border",
};

function PaymentBadge({
  paymentType,
}: {
  paymentType: SalesRecord["paymentType"];
}) {
  const isCredit = paymentType === "credit";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        isCredit ? "bg-credit/15 text-credit" : "bg-primary/10 text-primary"
      }`}
    >
      {isCredit ? "Credit" : "Cash"}
    </span>
  );
}

function DateCell({ record }: { record: SalesRecord }) {
  const time = manilaTimestamp.time(record.createdAt);

  return (
    <td className="px-4 py-3 font-sans text-muted-foreground">
      <span className="block">{record.date}</span>
      {time && (
        <span className="block text-xs text-muted-foreground/70">{time}</span>
      )}
    </td>
  );
}

function BadOrderQtyCell({ boQty }: { boQty: number }) {
  return (
    <td
      className={`px-4 py-3 text-right ${
        boQty > 0 ? "font-semibold text-destructive" : "text-muted-foreground"
      }`}
    >
      {boQty}
    </td>
  );
}

export function RecordRow({
  record,
  onClick,
}: {
  record: SalesRecord;
  onClick: () => void;
}) {
  const status = recordStatus(record);
  // A row with any bad order sits on a red wash so damaged stock stands out
  // while scanning the table.
  const rowTint =
    record.boQty > 0 ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/50";

  return (
    <tr
      className={`cursor-pointer border-b border-border/50 last:border-0 ${rowTint}`}
      onClick={onClick}
    >
      <td className="w-1 p-0">
        <span className={`block h-full w-1 ${STATUS_BAR[status]}`} />
      </td>
      <DateCell record={record} />
      <td className="px-4 py-3 font-sans">{record.agent}</td>
      <td className="px-4 py-3 font-sans">{record.store}</td>
      <td className="px-4 py-3 font-sans text-muted-foreground">
        {record.province}
      </td>
      <td className="px-4 py-3 font-sans">{record.product}</td>
      <td className="px-4 py-3 font-sans">
        <PaymentBadge paymentType={record.paymentType} />
      </td>
      <td className="px-4 py-3 text-right text-primary">{record.soldQty}</td>
      <BadOrderQtyCell boQty={record.boQty} />
      <td className="px-4 py-3 text-right text-muted-foreground">
        {formatCurrencyPHP(record.unitPrice)}
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {formatCurrencyPHP(record.total)}
      </td>
    </tr>
  );
}
