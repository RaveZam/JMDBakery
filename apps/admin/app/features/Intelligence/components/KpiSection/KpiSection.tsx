import { TrendingUp, TrendingDown, PackageX, Banknote } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import type { IntelligenceKpis } from "../../types";

export function KpiSection({ kpis }: { kpis: IntelligenceKpis }) {
  const isUp = kpis.revenueChangePct >= 0;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Business health overview</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Revenue trend vs previous day"
          primary={`${isUp ? "+" : ""}${kpis.revenueChangePct.toFixed(1)}%`}
          secondary={`Today ₱${kpis.revenueToday.toLocaleString()} vs Yesterday ₱${kpis.revenueYesterday.toLocaleString()}`}
          tone="primary"
          icon={isUp ? TrendingUp : TrendingDown}
        />
        <KpiCard
          title="Revenue this month"
          primary={"₱" + kpis.revenueThisMonth.toLocaleString()}
          tone="primary"
          icon={Banknote}
        />
        <KpiCard
          title="Bad orders"
          primary={"₱" + kpis.totalBadOrderAmount.toLocaleString()}
          secondary={`${kpis.totalBadOrderQty.toLocaleString()} pcs`}
          tone="critical"
          icon={PackageX}
        />
        <KpiCard
          title="Bad order risk level"
          primary={kpis.badOrderRisk.label}
          secondary={`Bad order rate ${kpis.badOrderRatePct.toFixed(1)}% this month`}
          tone={kpis.badOrderRisk.tone}
          icon={kpis.badOrderRisk.icon}
        />
      </div>
    </section>
  );
}
