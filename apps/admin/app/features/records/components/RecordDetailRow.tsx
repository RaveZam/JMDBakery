import type { ReactElement } from "react";

export function RecordDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        aria-hidden
        className="h-0 flex-1 translate-y-[-3px] border-b border-dotted border-border"
      />
      <span className="shrink-0 font-mono text-sm">{value}</span>
    </div>
  );
}
