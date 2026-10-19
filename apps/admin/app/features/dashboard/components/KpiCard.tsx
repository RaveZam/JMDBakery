import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import type { KpiCardAccent, KpiCardTone } from "../types/dashboard-types";
import { KpiIconChip } from "./KpiIconChip";

const accentChip: Record<KpiCardAccent, string> = {
  green: "bg-primary/10 text-primary",
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  amber:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  red: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  slate: "bg-muted text-muted-foreground",
};

type ToneStyle = {
  card: string;
  title: string;
  value: string;
  muted: string;
  chip?: string;
};

const solid = (background: string): ToneStyle => ({
  card: `border-transparent text-white ${background}`,
  title: "text-white/80",
  value: "",
  muted: "text-white/70",
  chip: "bg-white/15 text-white",
});

const toneStyle: Partial<Record<KpiCardTone, ToneStyle>> = {
  hero: solid("bg-primary"),
  primary: solid("bg-primary"),
  healthy: solid("bg-primary"),
  medium: solid("bg-amber-600"),
  warning: solid("bg-orange-600"),
  critical: solid("bg-red-800"),
  mint: {
    card: "border-emerald-100 bg-emerald-50/70 dark:border-primary/20 dark:bg-primary/10",
    title: "text-primary/70",
    value: "text-primary",
    muted: "text-primary/70",
  },
  rose: {
    card: "border-red-100 bg-red-50/60 dark:border-red-500/20 dark:bg-red-500/10",
    title: "text-red-800/70 dark:text-red-300/80",
    value: "text-red-800 dark:text-red-400",
    muted: "text-red-800/60 dark:text-red-300/70",
  },
};

const neutralStyle: ToneStyle = {
  card: "",
  title: "text-muted-foreground",
  value: "",
  muted: "text-muted-foreground",
};

export function KpiCard({
  title,
  primary,
  unit,
  secondary,
  tone = "neutral",
  accent = "green",
  icon: Icon,
  iconBesideValue = false,
}: {
  title: string;
  primary: string;
  unit?: string;
  secondary?: string;
  tone?: KpiCardTone;
  accent?: KpiCardAccent;
  icon?: LucideIcon;
  /** Shows the icon as a small circle next to the value instead of in the corner. */
  iconBesideValue?: boolean;
}) {
  const style = toneStyle[tone] ?? neutralStyle;
  const iconChip = Icon && (
    <KpiIconChip
      icon={Icon}
      colorClass={style.chip ?? accentChip[accent]}
      round={iconBesideValue}
    />
  );
  return (
    <Card
      className={cn(
        "border-border/70 shadow-soft dark:shadow-soft-dark",
        style.card,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className={cn("text-[13px] font-medium", style.title)}>{title}</p>
          {!iconBesideValue && iconChip}
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <p
            className={cn(
              "flex items-baseline gap-1.5 text-[28px] font-semibold leading-none tracking-tight tabular-nums",
              style.value,
            )}
          >
            {primary}
            {unit && (
              <span
                className={cn(
                  "text-[13px] font-medium tracking-normal",
                  style.muted,
                )}
              >
                {unit}
              </span>
            )}
          </p>
          {iconBesideValue && iconChip}
        </div>
        {secondary ? (
          <p className={cn("mt-2.5 text-xs", style.muted)}>{secondary}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
