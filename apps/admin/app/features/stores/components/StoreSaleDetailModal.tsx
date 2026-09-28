"use client";

import type { ReactElement } from "react";
import { createPortal } from "react-dom";

import { formatCurrencyPHP } from "@/lib/utils";
import { ModalOverlay } from "@/components/ModalOverlay";
import { useCloseOnEscape } from "@/hooks/useCloseOnEscape";
import { DetailRow } from "@/components/DetailRow";
import { DetailTotalRow } from "@/components/DetailTotalRow";
import { StoreSaleDetailHeader } from "./StoreSaleDetailHeader";
import { StoreSaleBadOrderReason } from "./StoreSaleBadOrderReason";
import type { StoreSale } from "../types/store-types";

export function StoreSaleDetailModal({
  sale,
  onClose,
}: {
  sale: StoreSale | null;
  onClose: () => void;
}): ReactElement | null {
  useCloseOnEscape(sale !== null, onClose);

  if (!sale) return null;

  return createPortal(
    <div
      // Sits on top of StoreDetailModal's z-50 overlay, since this opens from
      // a row inside it.
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <ModalOverlay onClose={onClose} />
      <div className="relative z-10 w-full max-w-md">
        <div className="pointer-events-auto w-full rounded-2xl border bg-background shadow-xl">
          <StoreSaleDetailHeader sale={sale} onClose={onClose} />
          <div className="px-5 py-4">
            <DetailRow label="Agent" value={sale.agentName ?? "Unknown"} />
            <DetailRow label="Sold" value={`${sale.quantitySold} pcs`} />
            <DetailRow label="Bad order" value={`${sale.quantityBadOrder} pcs`} />
            <DetailRow label="Unit price" value={formatCurrencyPHP(sale.unitPrice)} />
            <DetailTotalRow value={formatCurrencyPHP(sale.total)} colorClass="text-primary" />
            <StoreSaleBadOrderReason sale={sale} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
