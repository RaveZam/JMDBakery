import type { SalesRecord } from "@/app/server/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import { recordStatus, type RecordStatus } from "../helpers/recordStatus";

const STATUS_BAR: Record<RecordStatus, string> = {
  sale: "bg-primary",
  "bad-order": "bg-destructive",
  split: "bg-gold",
  none: "bg-border",
};

export function RecordRow({ record }: { record: SalesRecord }) {
  const status = recordStatus(record);

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/50">
      <td className="w-1 p-0">
        <span className={`block h-full w-1 ${STATUS_BAR[status]}`} />
      </td>
      <td className="px-4 py-3 font-sans text-muted-foreground">{record.date}</td>
      <td className="px-4 py-3 font-sans">{record.agent}</td>
      <td className="px-4 py-3 font-sans">{record.store}</td>
      <td className="px-4 py-3 font-sans text-muted-foreground">{record.province}</td>
      <td className="px-4 py-3 font-sans">{record.product}</td>
      <td className="px-4 py-3 text-right text-primary">{record.soldQty}</td>
      <td
        className={`px-4 py-3 text-right ${
          record.boQty > 0 ? "font-semibold text-destructive" : "text-muted-foreground"
        }`}
      >
        {record.boQty}
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground">
        {formatCurrencyPHP(record.unitPrice)}
      </td>
      <td className="px-4 py-3 text-right font-semibold">
        {formatCurrencyPHP(record.total)}
      </td>
    </tr>
  );
}
