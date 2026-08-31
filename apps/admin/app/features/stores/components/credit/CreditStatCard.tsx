import type { ReactElement } from "react";

export function CreditStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="rounded-xl border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
