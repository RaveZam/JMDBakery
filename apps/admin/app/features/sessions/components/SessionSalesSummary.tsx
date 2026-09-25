"use client";

import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import { useSessionSalesSummary } from "../hooks/useSessionSalesSummary";
import { SessionSalesTotals } from "./SessionSalesTotals";
import { SessionProductSummaryTable } from "./SessionProductSummaryTable";

export function SessionSalesSummary({
  sessionId,
}: {
  sessionId: string;
}): ReactElement {
  const { summary, loading } = useSessionSalesSummary(sessionId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-4 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading sales...
      </div>
    );
  }

  if (summary.products.length === 0) {
    return (
      <div className="rounded-xl border bg-background px-3 py-4 text-xs text-muted-foreground">
        No sales logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-background px-3 py-3">
      <SessionSalesTotals
        revenue={summary.revenue}
        piecesSold={summary.piecesSold}
        boValue={summary.boValue}
        piecesBO={summary.piecesBO}
      />
      <SessionProductSummaryTable products={summary.products} />
    </div>
  );
}
