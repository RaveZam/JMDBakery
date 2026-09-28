"use client";

import type { ReactElement } from "react";
import { createPortal } from "react-dom";

import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import { ModalOverlay } from "@/components/ModalOverlay";
import { useCloseOnEscape } from "@/hooks/useCloseOnEscape";
import { recordStatus } from "../helpers/recordStatus";
import { RecordDetailHeader } from "./RecordDetailHeader";
import { RecordDetailFields } from "./RecordDetailFields";
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
            <RecordDetailFields record={record} />
            <RecordDetailTotal record={record} status={status} />
            <RecordBadOrderReason record={record} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
