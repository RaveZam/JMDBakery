import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";

const NOTHING_COLLECTED =
  "Nothing was collected against store credit in the last month, or your search matched none of it.";

export function PaymentsEmptyState({
  title = "No payments in this window",
  message = NOTHING_COLLECTED,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 border-border/70 px-6 py-16 text-center shadow-soft dark:shadow-soft-dark">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <HandCoins className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{message}</p>
    </Card>
  );
}
