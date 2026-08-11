import type { CreditPayment } from "../types";
import { Card } from "@/components/ui/card";
import { PaymentRow } from "./PaymentRow";
import { PaymentsTableHeader } from "./PaymentsTableHeader";
import { PaymentsEmptyState } from "./PaymentsEmptyState";

export function PaymentsTable({ payments }: { payments: CreditPayment[] }) {
  if (payments.length === 0) return <PaymentsEmptyState />;

  return (
    <Card className="overflow-hidden border-border/70 p-0 shadow-soft dark:shadow-soft-dark">
      <div
        aria-hidden
        className="h-3 w-full bg-border/70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 6px, hsl(var(--background)) 3.5px, transparent 4px)",
          backgroundSize: "16px 12px",
          backgroundPosition: "top left",
        }}
      />
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <PaymentsTableHeader />
          <tbody className="font-mono tabular-nums">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
