"use client";

import { useState } from "react";
import type { ComponentType, ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankedRevenueList, type RankedRow } from "./RankedRevenueList";

type Direction = "highest" | "lowest";

const LIMIT = 5;

export function RevenueRankCard({
  title,
  icon: Icon,
  iconClassName,
  rows,
  emptyLabel,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  rows: RankedRow[];
  emptyLabel: string;
}): ReactElement {
  const [direction, setDirection] = useState<Direction>("highest");

  const displayed =
    direction === "highest"
      ? rows.slice(0, LIMIT)
      : rows.slice(-LIMIT).reverse();

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={`h-4 w-4 ${iconClassName ?? "text-amber-500"}`} />
            {title}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Past 6 months</p>
        </div>
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5 text-xs font-medium">
          {(["highest", "lowest"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`rounded-md px-3 py-1.5 capitalize transition-colors ${
                direction === d
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <RankedRevenueList
          rows={displayed}
          emptyLabel={emptyLabel}
          variant={direction === "lowest" ? "bottom" : "top"}
        />
      </CardContent>
    </Card>
  );
}
