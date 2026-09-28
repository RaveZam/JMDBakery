import type { ReactElement } from "react";

export function DetailTotalRow({
  value,
  colorClass,
}: {
  value: string;
  colorClass: string;
}): ReactElement {
  return (
    <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-border pt-3">
      <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
      <span className={`font-mono text-lg font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}
