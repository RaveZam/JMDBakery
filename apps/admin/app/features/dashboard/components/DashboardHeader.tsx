import { FILTERS, FilterRange } from "../types/dashboard-types";

function DashboardFilterToggle({
  filter,
  onFilterChange,
}: {
  filter: FilterRange;
  onFilterChange: (value: FilterRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-soft dark:shadow-soft-dark">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function DashboardHeader({
  filter,
  onFilterChange,
}: {
  filter: FilterRange;
  onFilterChange: (value: FilterRange) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-6 py-5 backdrop-blur">
      <div className="mx-auto w-full max-w-300">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-primary" />
              <h1 className="text-3xl font-semibold tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="mt-1.5 pl-3.5 text-sm text-muted-foreground">
              Monitor your field operations across every store.
            </p>
          </div>
          <DashboardFilterToggle filter={filter} onFilterChange={onFilterChange} />
        </div>
      </div>
    </header>
  );
}
