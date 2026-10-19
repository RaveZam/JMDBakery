import { TrendingUp, TrendingDown } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import type { IntelligenceKpis } from "../../types";
import { BadOrderRiskCard } from "./BadOrderRiskCard";

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
          iconBesideValue
        />
        <KpiCard
          title="Revenue this month"
          primary={"₱" + kpis.revenueThisMonth.toLocaleString()}
          secondary="Cash sales plus credit collected"
          tone="mint"
        />
        <KpiCard
          title="Bad orders this month"
          primary={"₱" + kpis.totalBadOrderAmount.toLocaleString()}
          secondary={`${kpis.totalBadOrderQty.toLocaleString()} pcs`}
          tone="rose"
        />
        <BadOrderRiskCard
          risk={kpis.badOrderRisk}
          ratePct={kpis.badOrderRatePct}
        />
      </div>
    </section>
  );
}
