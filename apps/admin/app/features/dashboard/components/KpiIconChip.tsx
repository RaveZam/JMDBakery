import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/** Square chip for the card corner, or a small circle when it sits beside the value. */
export function KpiIconChip({
  icon: Icon,
  colorClass,
  round,
}: {
  icon: LucideIcon;
  colorClass: string;
  round: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        round ? "h-8 w-8 rounded-full" : "h-9 w-9 rounded-lg",
        colorClass,
      )}
    >
      <Icon className={round ? "h-4 w-4" : "h-[18px] w-[18px]"} />
    </span>
  );
}
