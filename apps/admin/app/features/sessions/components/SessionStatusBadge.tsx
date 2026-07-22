import type { ReactElement } from "react";
import { Badge } from "@/components/ui/badge";

export function SessionStatusBadge({
  status,
}: {
  status: "ongoing" | "completed" | "cancelled";
}): ReactElement {
  if (status === "completed") {
    return <Badge variant="success">Completed</Badge>;
  }
  if (status === "cancelled") {
    return <Badge variant="destructive">Cancelled</Badge>;
  }
  return <Badge variant="warning">Running</Badge>;
}
