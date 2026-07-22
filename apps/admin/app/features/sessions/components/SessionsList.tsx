"use client";

import type { ReactElement } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { useSessionsBoard } from "../hooks/useSessionsBoard";
import type { SessionFilter } from "../helpers/sessionsBoard";
import type { SessionRow } from "../types/session-types";
import { SessionCard } from "./SessionCard";
import { SessionDetail } from "./SessionDetail";
import { SessionsFilterBar } from "./SessionsFilterBar";
import { SessionsPagination } from "./SessionsPagination";

function EmptyBoard(): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 py-16 text-center">
      <CalendarDays className="h-9 w-9 text-muted-foreground/40" />
      <p className="text-sm font-medium">No sessions yet</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        The first route an agent starts on the mobile app shows up here.
      </p>
    </div>
  );
}

const EMPTY_FILTER_MESSAGES: Record<Exclude<SessionFilter, "all">, string> = {
  ongoing: "No route is running right now.",
  completed: "No completed sessions to show.",
  cancelled: "No cancelled sessions to show.",
};

function EmptyFilter({ filter }: { filter: SessionFilter }): ReactElement {
  return (
    <div className="rounded-xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
      {filter === "all" ? "No sessions to show." : EMPTY_FILTER_MESSAGES[filter]}
    </div>
  );
}

function DetailPanel({ session }: { session: SessionRow | null }): ReactElement {
  if (!session) {
    return (
      <div className="hidden flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-24 text-center xl:flex">
        <MapPin className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium">Pick a session</p>
        <p className="max-w-[15rem] text-xs text-muted-foreground">
          Open one to see every stop on the route and what was sold there.
        </p>
      </div>
    );
  }
  return <SessionDetail session={session} />;
}

function SessionColumn({
  page,
  selection,
}: Pick<ReturnType<typeof useSessionsBoard>, "page" | "selection">): ReactElement {
  return (
    <div className="space-y-3">
      {page.sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          isSelected={session.id === selection.id}
          onClick={() => selection.onToggle(session.id)}
        />
      ))}
      {page.total > 1 && (
        <SessionsPagination
          page={page.current}
          totalPages={page.total}
          onPageChange={page.onChange}
        />
      )}
    </div>
  );
}

export function SessionsList({
  sessions,
}: {
  sessions: SessionRow[];
}): ReactElement {
  const board = useSessionsBoard(sessions);

  if (sessions.length === 0) return <EmptyBoard />;

  return (
    <div className="space-y-4">
      <SessionsFilterBar filter={board.filter} />
      {board.filter.count === 0 ? (
        <EmptyFilter filter={board.filter.value} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SessionColumn page={board.page} selection={board.selection} />
          <div className="xl:sticky xl:top-6 xl:self-start">
            <DetailPanel session={board.selection.session} />
          </div>
        </div>
      )}
    </div>
  );
}
