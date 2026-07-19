import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";

// Every count and ratio on the board is set in mono with tabular figures, so
// numbers line up column-to-column as the agent's stops tick over.
export function Figure({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <span
      className={cn(
        "font-[family-name:var(--font-mono)] tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}
