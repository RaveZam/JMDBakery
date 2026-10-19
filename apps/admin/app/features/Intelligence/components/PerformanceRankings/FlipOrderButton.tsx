import { ArrowUpDown } from "lucide-react";

export function FlipOrderButton({
  isFlipped,
  onFlip,
}: {
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-pressed={isFlipped}
      aria-label="Flip order"
      title="Flip order"
      className="-mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:bg-muted aria-pressed:text-foreground"
    >
      <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
