import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * Panel shell shared by the ranking cards. Fixed height keeps the row even;
 * the body scrolls if its rows don't fit.
 */
export function PanelCard({
  title,
  caption,
  action,
  isEmpty,
  children,
}: {
  title: string;
  caption: string;
  action?: ReactNode;
  isEmpty: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="flex h-[24rem] flex-col overflow-hidden border-border/70 p-0 shadow-soft dark:shadow-soft-dark">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-1">
        {isEmpty ? (
          <p className="py-6 text-sm text-muted-foreground">
            No data for this period.
          </p>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}
