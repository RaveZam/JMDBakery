import { Receipt, PackageCheck, PackageX, Percent } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import type { RecordsStats } from "../helpers/computeRecordsSummary";
import { RecordsPaymentSummary } from "./RecordsPaymentSummary";

export function RecordsSummary({ summary }: { summary: RecordsStats }) {
  // Six cards on one row at xl. Narrower screens step down rather than
  // squeezing, since the money values stop fitting well below ~190px a card.
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Total Records"
        primary={summary.totalRecords.toLocaleString()}
        tone="hero"
        icon={Receipt}
      />
      <KpiCard
        title="Units Sold"
        primary={`${summary.totalSoldQty.toLocaleString()} pcs`}
        accent="green"
        icon={PackageCheck}
      />
      <KpiCard
        title="Bad Order Units"
        primary={`${summary.totalBoQty.toLocaleString()} pcs`}
        accent="red"
        icon={PackageX}
      />
      <KpiCard
        title="Bad Order Rate"
        primary={`${summary.boRate.toFixed(1)}%`}
        accent="amber"
        icon={Percent}
      />
      <RecordsPaymentSummary summary={summary} />
    </div>
  );
}
