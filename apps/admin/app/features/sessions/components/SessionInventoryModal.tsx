"use client";

import type { ReactElement, ReactNode } from "react";
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatSessionDate } from "../helpers/sessionHelpers";
import { useSessionInventory } from "../hooks/useSessionInventory";
import type { SessionRow } from "../types/session-types";
import { InventorySummaryTable } from "./InventorySummaryTable";

type SessionInventoryModalProps = {
  session: SessionRow;
  onClose: () => void;
};

function ModalOverlay({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <button
      type="button"
      className="absolute inset-0 bg-black/40"
      aria-label="Close"
      onClick={onClose}
    />
  );
}

function ModalPanel({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border bg-background shadow-xl">
      {children}
    </div>
  );
}

function ModalHeader({
  titleId,
  session,
  onClose,
}: {
  titleId: string;
  session: SessionRow;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
      <div>
        <h2 id={titleId} className="text-base font-semibold">
          Inventory summary
        </h2>
        <p className="text-xs text-muted-foreground">
          {session.routeName} &middot; {formatSessionDate(session.sessionDate)}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-xl"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SessionInventoryPortal({
  titleId,
  session,
  onClose,
}: {
  titleId: string;
  session: SessionRow;
  onClose: () => void;
}): ReactElement {
  const { rows, loading } = useSessionInventory(session.id, true);

  return createPortal(
    <div
      className="fixed inset-0 z-50"
      aria-labelledby={titleId}
      role="dialog"
      aria-modal="true"
    >
      <ModalOverlay onClose={onClose} />
      <div className="pointer-events-none relative flex h-full w-full items-start justify-center p-4 sm:p-8">
        <ModalPanel>
          <ModalHeader titleId={titleId} session={session} onClose={onClose} />
          <div className="px-5 py-4">
            <InventorySummaryTable rows={rows} loading={loading} />
          </div>
        </ModalPanel>
      </div>
    </div>,
    document.body,
  );
}

export function SessionInventoryModal({
  session,
  onClose,
}: SessionInventoryModalProps): ReactElement | null {
  const titleId = `${useId()}-title`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return (): void => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  return (
    <SessionInventoryPortal titleId={titleId} session={session} onClose={onClose} />
  );
}
