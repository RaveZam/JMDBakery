"use client";

import type { ReactElement } from "react";

import { useSessionsQuery } from "./sessionsQuery";
import { SessionsList } from "./components/SessionsList";
import { SessionsBoardSkeleton } from "./components/SessionsBoardSkeleton";

export function SessionsPage(): ReactElement {
  const { data: sessions, isLoading } = useSessionsQuery();

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="text-3xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Field activity monitor. Track agent route sessions.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {isLoading ? (
            <SessionsBoardSkeleton />
          ) : (
            <SessionsList sessions={sessions} />
          )}
        </div>
      </div>
    </>
  );
}

export default SessionsPage;
