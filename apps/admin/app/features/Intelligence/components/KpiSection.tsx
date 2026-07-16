import { TrendingUp, TrendingDown, CalendarDays, BarChart2 } from "lucide-react";
import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import type { IntelligenceKpis } from "../helpers/kpis";

const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

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
          title="Predicted sales tomorrow"
          primary={`₱${Math.round(kpis.predictedRevenueTomorrow).toLocaleString()}`}
          secondary={`Your typical sales on ${WEEKDAY_NAMES[kpis.tomorrowWeekday]}`}
          tone="primary"
          icon={CalendarDays}
        />
        <KpiCard
          title="Projected 7-day revenue"
          primary={`₱${Math.round(kpis.projectedRevenueNext7Days).toLocaleString()}`}
          secondary="Based on your weekly sales this month"
          tone="primary"
          icon={BarChart2}
        />
        <KpiCard
          title="Backorder risk level"
          primary={kpis.backorderRisk.label}
          secondary={`BO rate ${kpis.backorderRatePct.toFixed(1)}% this month`}
          tone={kpis.backorderRisk.tone}
          icon={kpis.backorderRisk.icon}
        />
      </div>
    </section>
  );
}
