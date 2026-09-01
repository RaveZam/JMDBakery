"use client";

import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { ModalOverlay } from "@/app/features/products/components/ModalOverlay";
import { useCloseOnEscape } from "@/app/features/records/hooks/useCloseOnEscape";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrencyPHP } from "@/lib/utils";
import { manilaTimestamp } from "@/lib/manilaTimestamp";
import type {
  CreditEntrySale,
  CreditLedgerEntry,
} from "../../types/store-types";

function SaleLine({ sale }: { sale: CreditEntrySale }): ReactElement {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate">{sale.productName}</p>
        {sale.quantityBadOrder > 0 && (
          <p className="text-xs text-destructive">
            {sale.quantityBadOrder} bad order
            {sale.badOrderReason ? ` — ${sale.badOrderReason}` : ""}
          </p>
        )}
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums text-xs text-muted-foreground">
        ×{sale.quantitySold}
      </span>
      <span className="w-24 shrink-0 text-right tabular-nums font-semibold">
        {formatCurrencyPHP(sale.total)}
      </span>
    </li>
  );
}

function SalesBody({
  sales,
  loading,
  error,
}: {
  sales: CreditEntrySale[];
  loading: boolean;
  error: string | null;
}): ReactElement {
  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-xs text-destructive">{error}</p>;
  if (sales.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No credit orders behind this entry. It was logged against the store
        rather than a delivery.
      </p>
    );
  }

  const total = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <>
      <ul className="divide-y divide-border/60">
        {sales.map((sale) => (
          <SaleLine key={sale.id} sale={sale} />
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Delivered on credit</span>
        <span className="tabular-nums font-semibold">
          {formatCurrencyPHP(total)}
        </span>
      </div>
    </>
  );
}

function ModalHeader({
  entry,
  onClose,
}: {
  entry: CreditLedgerEntry;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="flex items-start justify-between border-b px-5 py-4">
      <div>
        <h2 className="text-base font-semibold">
          {formatCurrencyPHP(entry.amount)} on credit
        </h2>
        <p className="text-xs text-muted-foreground">
          {manilaTimestamp.dayLong(entry.createdAt)}
          {entry.recordedByName ? ` \u00b7 ${entry.recordedByName}` : ""}
        </p>
      </div>
      <button
        type="button"
        className="ml-4 rounded-lg p-1 transition-colors hover:bg-muted"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * The orders a single credit entry was raised against. Opens on top of the
 * store detail modal, so it sits a layer above it.
 */
export function CreditEntrySalesModal({
  visible,
  entry,
  sales,
  loading,
  error,
  onClose,
}: {
  visible: boolean;
  entry: CreditLedgerEntry | null;
  sales: CreditEntrySale[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}): ReactElement | null {
  const open = visible && entry !== null;
  useCloseOnEscape(open, onClose);

  // entry is checked as well as visible so the body below can treat it as
  // non-null; the two always move together in practice.
  if (!open || !entry) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <ModalOverlay onClose={onClose} />
      <div className="pointer-events-auto relative z-10 flex max-h-[70vh] w-full max-w-lg flex-col rounded-2xl border bg-background shadow-xl">
        <ModalHeader entry={entry} onClose={onClose} />
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <SalesBody sales={sales} loading={loading} error={error} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
