import type { ReactElement } from "react";

import type { SessionsSummary } from "../helpers/sessionsBoard";
import { Figure } from "./Figure";

function HeaderSubline({ summary }: { summary: SessionsSummary }): ReactElement {
  if (summary.total === 0) {
    return <span>Route sessions land here the moment an agent heads out.</span>;
  }

  const routeLabel = summary.running === 1 ? "route" : "routes";

  return (
    <span>
      {summary.running > 0 ? (
        <>
          <span className="font-medium text-foreground">{summary.running}</span>{" "}
          {routeLabel} on the road right now
        </>
      ) : (
        <>Every route is in for the day</>
      )}
      <span className="mx-2 text-border">·</span>
      <Figure>{summary.visitedStores}</Figure> of{" "}
      <Figure>{summary.plannedStores}</Figure> planned stops covered
    </span>
  );
}

export function SessionsHeader({
  summary,
}: {
  summary: SessionsSummary;
}): ReactElement {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-6 py-5 backdrop-blur">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Sessions</h1>
        </div>
        <p className="mt-1.5 pl-3.5 text-sm text-muted-foreground">
          <HeaderSubline summary={summary} />
        </p>
      </div>
    </header>
  );
}
