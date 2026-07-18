"use client";

import type { ForecastRange } from "../types";

const RANGE_OPTIONS: { value: ForecastRange; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function ForecastRangeToggle({
  range,
  onChange,
}: {
  range: ForecastRange;
  onChange: (range: ForecastRange) => void;
}): React.ReactElement {
  return (
    <div className="flex rounded-md overflow-hidden text-xs font-medium border border-emerald-800">
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 transition-colors ${
            range === option.value
              ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white"
              : "bg-background text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
