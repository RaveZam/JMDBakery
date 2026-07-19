"use client";

import type { ReactElement } from "react";

import { useSessionsBoard } from "../hooks/useSessionsBoard";
import { SESSION_FILTERS } from "../helpers/sessionsBoard";
import { Figure } from "./Figure";

export function SessionsFilterBar({
  filter,
}: {
  filter: ReturnType<typeof useSessionsBoard>["filter"];
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft dark:shadow-soft-dark">
        {SESSION_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => filter.onChange(value)}
            aria-pressed={filter.value === value}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              filter.value === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        <Figure className="font-medium text-foreground">
          {filter.count.toLocaleString()}
        </Figure>{" "}
        {filter.count === 1 ? "session" : "sessions"}
      </p>
    </div>
  );
}
