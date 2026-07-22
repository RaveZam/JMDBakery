"use client";

import type { ReactElement } from "react";
import { createPortal } from "react-dom";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { formatCurrencyPHP } from "@/lib/utils";
import { ModalOverlay } from "@/app/features/products/components/ModalOverlay";
import { recordStatus } from "../helpers/recordStatus";
import { useCloseOnEscape } from "../hooks/useCloseOnEscape";
import { RecordDetailHeader } from "./RecordDetailHeader";
import { RecordDetailRow } from "./RecordDetailRow";
import { RecordDetailTotal } from "./RecordDetailTotal";
import { RecordBadOrderReason } from "./RecordBadOrderReason";

export function RecordDetailModal({
  record,
  onClose,
}: {
  record: SalesRecord | null;
  onClose: () => void;
}): ReactElement | null {
  useCloseOnEscape(record !== null, onClose);

  if (!record) return null;

  const status = recordStatus(record);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <ModalOverlay onClose={onClose} />
      <div className="relative z-10 w-full max-w-md">
        <div className="pointer-events-auto w-full rounded-2xl border bg-background shadow-xl">
          <RecordDetailHeader record={record} status={status} onClose={onClose} />
          <div className="px-5 py-4">
            <RecordDetailRow label="Agent" value={record.agent} />
            <RecordDetailRow label="Product" value={record.product} />
            <RecordDetailRow label="Sold" value={String(record.soldQty)} />
            <RecordDetailRow label="Bad order" value={String(record.boQty)} />
            <RecordDetailRow label="Unit price" value={formatCurrencyPHP(record.unitPrice)} />
            <RecordDetailTotal record={record} status={status} />
            <RecordBadOrderReason record={record} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
