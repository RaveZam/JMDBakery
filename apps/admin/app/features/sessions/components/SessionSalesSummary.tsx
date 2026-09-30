"use client";

import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import { formatCurrencyPHP } from "@/lib/utils";
import { useSessionSalesSummary } from "../hooks/useSessionSalesSummary";
import { Figure } from "./Figure";
import { SessionSalesTotals } from "./SessionSalesTotals";
import { SessionProductSummaryTable } from "./SessionProductSummaryTable";

export function SessionSalesSummary({
  sessionId,
  collectedTotal,
}: {
  sessionId: string;
  collectedTotal: number;
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
    // No sales, but credit payments may still have been collected.
    if (collectedTotal > 0) {
      return (
        <div className="rounded-xl border bg-background px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Collected from credits
          </p>
          <p className="mt-0.5 text-lg font-semibold">
            <Figure className="text-primary">
              {formatCurrencyPHP(collectedTotal)}
            </Figure>
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border bg-background px-3 py-4 text-xs text-muted-foreground">
        No sales logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-background px-3 py-3">
      <SessionSalesTotals
        cashTotal={summary.cashTotal}
        cashPieces={summary.cashPieces}
        creditTotal={summary.creditTotal}
        creditPieces={summary.creditPieces}
        boValue={summary.boValue}
        piecesBO={summary.piecesBO}
        collectedTotal={collectedTotal}
      />
      <SessionProductSummaryTable products={summary.products} />
    </div>
  );
}
