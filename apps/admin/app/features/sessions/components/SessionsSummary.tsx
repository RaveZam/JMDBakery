import type { ReactElement } from "react";
import { CalendarDays, Route, Store } from "lucide-react";

import { KpiCard } from "@/app/features/dashboard/components/KpiCard";
import { visitRate } from "../helpers/sessionHelpers";
import type { SessionsSummary as Summary } from "../helpers/sessionsBoard";

export function SessionsSummary({
  summary,
}: {
  summary: Summary;
}): ReactElement {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KpiCard
        title="Sessions logged"
        primary={summary.total.toLocaleString()}
        tone="hero"
        icon={CalendarDays}
      />
      <KpiCard
        title="Running now"
        primary={summary.running.toLocaleString()}
        secondary={
          summary.running === 0
            ? "No route is running"
            : "Agents still working their stops"
        }
        accent={summary.running > 0 ? "amber" : "slate"}
        icon={Route}
      />
      <KpiCard
        title="Stop coverage"
        primary={visitRate(summary.visitedStores, summary.plannedStores)}
        secondary={`${summary.visitedStores.toLocaleString()} of ${summary.plannedStores.toLocaleString()} planned stops`}
        accent="green"
        icon={Store}
      />
    </div>
  );
}
