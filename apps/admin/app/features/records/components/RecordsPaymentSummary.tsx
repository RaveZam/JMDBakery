import { Banknote, CreditCard } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import { formatCurrencyPHP } from "@/lib/utils";
import type { RecordsStats } from "../helpers/computeRecordsSummary";

export function RecordsPaymentSummary({ summary }: { summary: RecordsStats }) {
  return (
    <>
      <KpiCard
        title="Cash Sales"
        primary={formatCurrencyPHP(summary.cashTotal)}
        accent="green"
        icon={Banknote}
      />
      <KpiCard
        title="Credit Sales"
        primary={formatCurrencyPHP(summary.creditTotal)}
        accent="gold"
        icon={CreditCard}
      />
    </>
  );
}
