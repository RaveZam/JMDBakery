/**
 * The shared rail used across the ranking panels: a hairline track whose fill
 * shows how one row compares with the strongest row in the same list.
 */
export function MetricRail({
  fraction,
  fillClass,
}: {
  fraction: number;
  fillClass: string;
}) {
  const width = Math.max(Math.min(fraction, 1), 0) * 100;

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full ${fillClass}`}
        style={{ width: `${Math.max(width, 2)}%` }}
      />
    </div>
  );
}
