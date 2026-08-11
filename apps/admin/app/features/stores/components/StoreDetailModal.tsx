"use client";

import { useEffect, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { ModalOverlay } from "@/app/features/products/components/ModalOverlay";
import { StoreLocationContact } from "./StoreLocationContact";
import { StoreTopProductsPanel } from "./StoreTopProductsPanel";
import { StoreCreditPanel } from "./StoreCreditPanel";
import { StoreDetailTabs, type StoreDetailTab } from "./StoreDetailTabs";
import { MOCK_LEDGER } from "../mockCredit";
import type { StoreCreditByStore } from "../types/store-types";

function useCloseOnEscape(active: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!active) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active, onClose]);
}

function StoreDetailHeader({
  store,
  onClose,
}: {
  store: StoreCreditByStore;
  onClose: () => void;
}): ReactElement {
  const joined = new Date(store.createdAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-start justify-between border-b px-5 py-4">
      <div>
        <h2 className="text-base font-semibold">{store.storeName}</h2>
        <p className="text-xs text-muted-foreground">Joined {joined}</p>
      </div>
      <button
        type="button"
        className="ml-4 rounded-lg p-1 hover:bg-muted transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function StoreDetailModal({
  store,
  onClose,
}: {
  store: StoreCreditByStore | null;
  onClose: () => void;
}): ReactElement | null {
  useCloseOnEscape(store !== null, onClose);
  const [tab, setTab] = useState<StoreDetailTab>("info");

  if (!store) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ModalOverlay onClose={onClose} />
      <div className="relative z-10 flex h-[75vh] w-full max-w-5xl flex-col">
        <div className="pointer-events-auto flex h-[75vh] w-full flex-col rounded-2xl border bg-background shadow-xl">
          <StoreDetailHeader store={store} onClose={onClose} />
          <StoreDetailTabs active={tab} onChange={setTab} />

          <div className="min-h-0 flex-1">
            {tab === "info" ? (
              <div className="grid h-full grid-cols-[1fr_300px] divide-x overflow-y-auto">
                <StoreLocationContact store={store} />
                {/* store.memberIds may hold >1 underlying store id if this card
                    merged duplicate DB rows; fetch + merge top products for all
                    of them so this panel isn't missing sales from a duplicate. */}
                <StoreTopProductsPanel storeIds={store.memberIds} />
              </div>
            ) : (
              <StoreCreditPanel store={store} entries={MOCK_LEDGER} />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
