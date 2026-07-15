"use client";

import type { ReactElement } from "react";
import { MapPin } from "lucide-react";

export type RankedRow = {
  key: string;
  title: string;
  caption?: string | null;
  revenue: number;
};

const TOP_RANK_ACCENT = [
  "text-amber-600 dark:text-amber-400",
  "text-slate-500 dark:text-slate-300",
  "text-orange-700 dark:text-orange-400",
  "text-muted-foreground",
  "text-muted-foreground",
];

const TOP_BAR_ACCENT = [
  "bg-amber-500",
  "bg-slate-400",
  "bg-orange-600",
  "bg-slate-300 dark:bg-slate-600",
  "bg-slate-300 dark:bg-slate-600",
];

const BOTTOM_RANK_ACCENT = "text-red-600 dark:text-red-400";
const BOTTOM_BAR_ACCENT = "bg-red-500/80";

function peso(value: number): string {
  return "₱" + Math.round(value).toLocaleString();
}

export function RankedRevenueList({
  rows,
  emptyLabel,
  variant = "top",
}: {
  rows: RankedRow[];
  emptyLabel: string;
  variant?: "top" | "bottom";
}): ReactElement {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <MapPin className="h-6 w-6 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => r.revenue));

  return (
    <ol className="space-y-3">
      {rows.map((r, i) => {
        const share = max === 0 ? 0 : (r.revenue / max) * 100;
        const rankClass =
          variant === "bottom"
            ? BOTTOM_RANK_ACCENT
            : (TOP_RANK_ACCENT[i] ?? "text-muted-foreground");
        const barClass =
          variant === "bottom"
            ? BOTTOM_BAR_ACCENT
            : (TOP_BAR_ACCENT[i] ?? "bg-slate-300");
        return (
          <li key={r.key} className="flex items-center gap-3">
            <span
              className={`w-5 shrink-0 text-right text-sm font-bold tabular-nums ${rankClass}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {r.title || "Unspecified"}
                  {r.caption && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {r.caption}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {peso(r.revenue)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${barClass}`}
                  style={{ width: `${share}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
