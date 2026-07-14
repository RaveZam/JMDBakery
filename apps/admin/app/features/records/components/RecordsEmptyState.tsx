import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RecordsEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-border/70 px-6 py-16 text-center shadow-soft dark:shadow-soft-dark">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Receipt className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium">No records match your filters</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Try a different search term, or switch back to all records.
      </p>
    </Card>
  );
}
