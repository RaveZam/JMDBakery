import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import type { KpiCardAccent, KpiCardTone } from "../types/dashboard-types";

const accentChip: Record<KpiCardAccent, string> = {
  green: "bg-primary/10 text-primary",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  amber:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  slate: "bg-muted text-muted-foreground",
};

const solidTone: Partial<Record<KpiCardTone, string>> = {
  hero: "bg-primary",
  primary: "bg-primary",
  healthy: "bg-primary",
  medium: "bg-amber-600",
  warning: "bg-amber-600",
  critical: "bg-red-600",
};

export function KpiCard({
  title,
  primary,
  secondary,
  tone = "neutral",
  accent = "green",
  icon: Icon,
}: {
  title: string;
  primary: string;
  secondary?: string;
  tone?: KpiCardTone;
  accent?: KpiCardAccent;
  icon?: LucideIcon;
}) {
  const solid = solidTone[tone];
  return (
    <Card
      className={cn(
        "border-border/70 shadow-soft dark:shadow-soft-dark",
        solid && `border-transparent text-white ${solid}`,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "text-[13px] font-medium",
              solid ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {title}
          </p>
          {Icon && (
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                solid ? "bg-white/15 text-white" : accentChip[accent],
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
          )}
        </div>
        <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums">
          {primary}
        </p>
        {secondary ? (
          <p
            className={cn(
              "mt-2.5 text-xs",
              solid ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {secondary}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
