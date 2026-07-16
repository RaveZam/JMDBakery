import type { ReactElement } from "react";
import { Crown } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { formatAddress } from "../helpers/storeHelpers";
import type { GroupedStoreRow } from "../types/store-types";

// The top 3 earners get a crown over their rank number — gold, silver, bronze.
// The list stays sorted by revenue (groupStoresByLocation), so the crown marks
// a real standing, not decoration.
const CROWN_COLORS: Record<number, string> = {
  1: "#D4A93C",
  2: "#9AA5B1",
  3: "#B4703C",
};

function RankMarker({ rank }: { rank: number }): ReactElement {
  const crownColor = CROWN_COLORS[rank];

  return (
    <span className="flex w-7 shrink-0 flex-col items-center gap-0.5">
      {crownColor && (
        <Crown
          className="h-3.5 w-3.5"
          style={{ color: crownColor }}
          strokeWidth={2}
          aria-hidden
        />
      )}
      <span
        className={`text-sm tabular-nums ${
          crownColor
            ? "font-semibold text-foreground"
            : "text-muted-foreground/70"
        }`}
      >
        {rank}
      </span>
    </span>
  );
}

export function StoreRankRow({
  store,
  rank,
  shareOfLeader,
  onSelect,
}: {
  store: GroupedStoreRow;
  rank: number;
  shareOfLeader: number;
  onSelect: (store: GroupedStoreRow) => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={() => onSelect(store)}
      className="group flex w-full items-center gap-4 border-b border-border/60 px-2 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <RankMarker rank={rank} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-sm font-semibold group-hover:text-primary">
            {store.storeName}
          </h3>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrencyPHP(store.totalRevenue)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatAddress(store.barangay, store.city, store.province)}
        </p>
        <div className="mt-2 h-1 w-full rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-primary"
            style={{ width: `${Math.max(shareOfLeader * 100, 3)}%` }}
          />
        </div>
      </div>
    </button>
  );
}
