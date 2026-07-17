import type { ReactElement } from "react";
import { MapPin } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import type { StoreStats } from "../types/store-types";

function StatPill({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
}): ReactElement {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-2.5">
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-lg font-semibold tabular-nums ${
          emphasize ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function StoresHeader({ stats }: { stats: StoreStats }): ReactElement {
  return (
    <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-6 backdrop-blur dark:bg-background/80">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <MapPin className="h-3.5 w-3.5" />
          Field Operations
        </div>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight">Stores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every retail account on the route, ranked by revenue this month.
        </p>

        <dl className="mt-5 grid max-w-xl grid-cols-3 gap-3">
          <StatPill label="Accounts" value={stats.storeCount} />
          <StatPill
            label="Revenue (This Month)"
            value={formatCurrencyPHP(stats.totalRevenue)}
            emphasize
          />
          <StatPill label="Leading province (This Month)" value={stats.topProvince ?? "—"} />
        </dl>
      </div>
    </header>
  );
}
