import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IntelligenceAction } from "../../constants/nextBestActions";

const priorityVariant: Record<string, "warning" | "secondary" | "pending"> = {
  P0: "warning",
  P1: "secondary",
  P2: "pending",
  P3: "warning",
};

const confidenceVariant: Record<string, "success" | "default" | "pending" | "warning"> = {
  High: "success",
  Med: "default",
  Low: "pending",
  Critical: "warning",
};

export function IntelligenceActionCard({
  action,
}: {
  action: IntelligenceAction;
}): ReactElement {
  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <h3 className="mt-3 text-base font-semibold leading-tight">
          {action.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{action.why}</p>
        <p className="mt-2 text-xs font-medium text-foreground">
          Next step: {action.action}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <Badge variant={priorityVariant[action.priority] ?? "secondary"}>
            {action.priority}
          </Badge>
          <Badge variant={confidenceVariant[action.confidence] ?? "default"}>
            {action.confidence}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
