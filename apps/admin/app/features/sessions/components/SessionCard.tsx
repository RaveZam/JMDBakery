import type { ReactElement } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import { formatSessionDate, visitRate } from "../helpers/sessionHelpers";
import type { SessionRow } from "../types/session-types";
import { Figure } from "./Figure";
import { RouteTrack } from "./RouteTrack";
import { SessionStatusBadge } from "./SessionStatusBadge";

function CardHeadline({ session }: { session: SessionRow }): ReactElement {
  const startedAt = manilaTimestamp.time(session.createdAt);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight">
          <span className="truncate">{session.routeName}</span>
          {session.agentName && (
            <span className="shrink-0 truncate text-xs font-normal text-muted-foreground">
              {session.agentName}
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatSessionDate(session.sessionDate)}
          {startedAt && (
            <span className="text-muted-foreground/70">
              {" "}
              &middot; started {startedAt}
            </span>
          )}
        </p>
      </div>
      <SessionStatusBadge status={session.status} />
    </div>
  );
}

function CardFigures({ session }: { session: SessionRow }): ReactElement {
  return (
    <div className="mt-2.5 flex items-baseline justify-between text-xs">
      <span className="text-muted-foreground">
        <Figure className="text-foreground">{session.visitedStores}</Figure>
        <span className="mx-0.5 text-border">/</span>
        <Figure>{session.totalStores}</Figure>
        <span className="ml-1.5">stops</span>
      </span>
      <Figure className="text-[13px] font-medium">
        {visitRate(session.visitedStores, session.totalStores)}
      </Figure>
    </div>
  );
}

export function SessionCard({
  session,
  isSelected,
  onClick,
}: {
  session: SessionRow;
  isSelected: boolean;
  onClick: () => void;
}): ReactElement {
  return (
    <Card
      className={cn(
        "border-border/70 shadow-soft transition-colors dark:shadow-soft-dark",
        isSelected
          ? "border-primary/60 ring-1 ring-primary/25"
          : "hover:border-primary/30",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className="w-full rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardHeadline session={session} />
        <div className="mt-4">
          <RouteTrack
            visited={session.visitedStores}
            total={session.totalStores}
            live={session.status === "ongoing"}
          />
        </div>
        <CardFigures session={session} />
      </button>
    </Card>
  );
}
