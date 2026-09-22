import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * Panel shell shared by the ranking cards so their titles, captions and first
 * rows line up across the row regardless of how many rows each one holds.
 */
export function PanelCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex h-[21rem] flex-col overflow-hidden border-border/70 p-0 shadow-soft dark:shadow-soft-dark">
      <div className="border-b border-border/70 px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {/* Two-line floor keeps the first row aligned when one caption wraps. */}
        <p className="mt-0.5 min-h-8 text-xs text-muted-foreground">
          {caption}
        </p>
      </div>
      {/* min-h-0 lets the body shrink below its content so it scrolls
          instead of stretching the card. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">{children}</div>
    </Card>
  );
}
