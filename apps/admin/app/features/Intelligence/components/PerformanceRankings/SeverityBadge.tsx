import type { BadOrderSeverity } from "../../helpers/badOrderSeverity";

/**
 * Flags a row that needs attention. Healthy rows stay quiet on screen so the
 * problem rows stand out, but screen readers still hear the label.
 */
export function SeverityBadge({ severity }: { severity: BadOrderSeverity }) {
  if (severity.level === "healthy") {
    return <span className="sr-only">{severity.label}</span>;
  }

  return (
    <span
      className={`shrink-0 rounded-full bg-current/10 px-1.5 py-px text-[11px] font-medium leading-4 ${severity.textClass}`}
    >
      {severity.label}
    </span>
  );
}
