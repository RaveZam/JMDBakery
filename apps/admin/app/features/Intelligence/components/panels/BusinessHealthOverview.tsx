import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart2,
} from "lucide-react";
import { KpiCard } from "../../../dashboard/components/KpiCard";
import type { IntelligenceMetrics } from "../../helpers/getIntelligenceMetrics";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function BusinessHealthOverview({
  metrics,
}: {
  metrics: IntelligenceMetrics;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Business health overview</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Revenue trend vs previous day"
          primary={`${metrics.percentageDiff >= 0 ? "+" : ""}${metrics.percentageDiff.toFixed(1)}%`}
          secondary={`Today ₱${metrics.totalSalesToday} vs Yesterday ₱${metrics.totalSalesYesterday}`}
          tone="primary"
          icon={metrics.percentageDiff >= 0 ? TrendingUp : TrendingDown}
        />
        <KpiCard
          title="Predicted sales Tomorrow"
          primary={`₱${metrics.predictedRevenueForTomorrow}`}
          secondary={`Your Typical Sales On  ${WEEKDAYS[(metrics.dayToday + 1) % 7]}`}
          tone="primary"
          icon={CalendarDays}
        />
        <KpiCard
          title="Projected 7 Day Revenue"
          primary={`₱${Math.round(metrics.averageSalesNextWeek).toLocaleString()}`}
          secondary="Based From your weekly Sales This Month"
          tone="primary"
          icon={BarChart2}
        />
        <KpiCard
          title="BO risk level"
          primary={metrics.boRisk.label}
          secondary={`BO Rate ${metrics.borate.toFixed(1)}% This Month`}
          tone={metrics.boRisk.tone}
          icon={metrics.boRisk.icon}
        />
      </div>
    </section>
  );
}
