"use client";

import { cn } from "@/lib/utils";

export type DisplayMetric = "pesos" | "pieces";

type DisplayMetricToggleProps = {
  value: DisplayMetric;
  onChange: (value: DisplayMetric) => void;
};

const OPTIONS: { value: DisplayMetric; label: string }[] = [
  { value: "pesos", label: "Pesos" },
  { value: "pieces", label: "Pieces" },
];

export function DisplayMetricToggle({
  value,
  onChange,
}: DisplayMetricToggleProps): React.ReactElement {
  return (
    <div className="inline-flex items-center rounded-md border border-input bg-background p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
