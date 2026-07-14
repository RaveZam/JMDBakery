import { Receipt, PackageCheck, PackageX, Percent } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import type { RecordsStats } from "../helpers/computeRecordsSummary";

export function RecordsSummary({ summary }: { summary: RecordsStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    </div>
  );
}
