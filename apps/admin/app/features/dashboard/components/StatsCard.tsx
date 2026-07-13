import type { ReactElement } from "react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatsCardTone } from "../types/dashboard-types";

function StatsCardArrow({ tone }: { tone: StatsCardTone }): ReactElement {
  return (
    <div
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border",
        tone === "primary"
          ? "border-white/25 bg-white/10"
          : "border-border bg-background",
      )}
    >
      <ArrowUpRight
        className={cn(
          "h-4 w-4",
          tone === "primary" ? "text-white" : "text-muted-foreground",
        )}
      />
    </div>
  );
}

function StatsCardFooter({
  tone,
  footer,
}: {
  tone: StatsCardTone;
  footer?: string;
}): ReactElement | null {
  if (!footer) return null;
  return (
    <p
      className={cn(
        "mt-4 text-xs",
        tone === "primary" ? "text-emerald-50/80" : "text-muted-foreground",
      )}
    >
      {footer}
    </p>
  );
}

export function StatsCard({
  title,
  value,
  footer,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  footer?: string;
  tone?: StatsCardTone;
}): ReactElement {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        tone === "primary" &&
          "border-transparent bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                tone === "primary"
                  ? "text-emerald-50/90"
                  : "text-muted-foreground",
              )}
            >
              {title}
            </p>
            <p className="mt-2 text-4xl font-semibold leading-none tracking-tight">
              {value}
            </p>
          </div>
          <StatsCardArrow tone={tone} />
        </div>
        <StatsCardFooter tone={tone} footer={footer} />
      </CardContent>
    </Card>
  );
}
