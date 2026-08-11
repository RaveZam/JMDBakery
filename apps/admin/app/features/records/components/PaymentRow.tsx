import type { CreditPayment } from "../types";
import { formatCurrencyPHP } from "@/lib/utils";

export function PaymentRow({ payment }: { payment: CreditPayment }) {
  // Most payments are collected and encoded by the same agent. Dimming the
  // repeat keeps the eye on the rows where two different people were involved.
  const sameAgent = payment.collectedBy === payment.encodedBy;

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/50">
      <td className="w-1 p-0">
        <span className="block h-full w-1 bg-primary" />
      </td>
      <td className="px-4 py-3 font-sans text-muted-foreground">
        {payment.date}
      </td>
      <td className="px-4 py-3 font-sans">{payment.store}</td>
      <td className="px-4 py-3 font-sans text-muted-foreground">
        {payment.province || "—"}
      </td>
      <td className="px-4 py-3 font-sans">{payment.collectedBy}</td>
      <td
        className={`px-4 py-3 font-sans ${sameAgent ? "text-muted-foreground" : ""}`}
      >
        {payment.encodedBy}
      </td>
      <td className="px-4 py-3 font-sans text-muted-foreground">
        {payment.note || "—"}
      </td>
      <td className="px-4 py-3 text-right font-semibold text-primary">
        {formatCurrencyPHP(payment.amount)}
      </td>
    </tr>
  );
}
