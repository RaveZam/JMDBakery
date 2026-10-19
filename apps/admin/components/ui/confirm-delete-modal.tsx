"use client";

import type { ReactElement } from "react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

type ConfirmDeleteModalProps = {
  title: string;
  description: string;
  // When set, the Delete button stays disabled until this exact text is typed.
  confirmationText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({
  title,
  description,
  confirmationText,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps): ReactElement | null {
  const titleId = `${useId()}-title`;
  const inputId = `${useId()}-confirm`;
  const [typedText, setTypedText] = useState("");
  const canDelete = confirmationText === undefined || typedText === confirmationText;

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

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="pointer-events-none relative flex h-full w-full items-center justify-center p-4">
        <div className="pointer-events-auto w-full max-w-sm rounded-2xl border bg-background shadow-xl">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <TriangleAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 id={titleId} className="text-sm font-semibold">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {confirmationText !== undefined ? (
              <div className="mt-4 space-y-2">
                <label htmlFor={inputId} className="text-sm text-muted-foreground">
                  Type <span className="font-semibold text-foreground">{confirmationText}</span> to confirm.
                </label>
                <Input
                  id={inputId}
                  value={typedText}
                  autoComplete="off"
                  onChange={(e) => setTypedText(e.target.value)}
                />
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
            <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canDelete}
              className="rounded-2xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
