import { cn } from "@/lib/utils";
import type { BadOrderRisk, BadOrderRiskTone } from "../../types";

const toneChip: Record<BadOrderRiskTone, string> = {
  healthy: "bg-primary/10 text-primary",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  warning:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  critical: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

export function RiskIcon({ risk }: { risk: BadOrderRisk }) {
  const Icon = risk.icon;

  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        toneChip[risk.tone],
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
