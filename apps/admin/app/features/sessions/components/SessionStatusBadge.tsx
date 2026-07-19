import type { ReactElement } from "react";
import { Badge } from "@/components/ui/badge";

export function SessionStatusBadge({
  status,
}: {
  status: "ongoing" | "completed";
}): ReactElement {
  return (
    <Badge variant={status === "completed" ? "success" : "warning"}>
      {status === "completed" ? "Completed" : "Running"}
    </Badge>
  );
}
