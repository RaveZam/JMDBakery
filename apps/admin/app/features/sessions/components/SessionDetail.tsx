"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyPHP } from "@/lib/utils";
import { useSessionStores } from "../hooks/useSessionStores";
import { useSessionPayments } from "../hooks/useSessionPayments";
import { formatSessionDate, visitRate } from "../helpers/sessionHelpers";
import type { SessionPaymentRow, SessionRow } from "../types/session-types";
import { SessionInventoryModal } from "./SessionInventoryModal";
import { StoreEntry } from "./StoreEntry";

function StoreEntryList({
  session,
  paymentsByStore,
}: {
  session: SessionRow;
  paymentsByStore: Record<string, SessionPaymentRow[]>;
}): ReactElement {
  const { stores, loading } = useSessionStores(session.id);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Loading stores...
      </p>
    );
  }
  if (stores.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No stores entered for this session.
      </p>
    );
  }
  return (
    <>
      {stores.map((store) => (
        <StoreEntry
          key={store.id}
          store={store}
          payments={paymentsByStore[store.id] ?? []}
          expanded={expandedStoreId === store.id}
          onToggle={() =>
            setExpandedStoreId((current) =>
              current === store.id ? null : store.id,
            )
          }
        />
      ))}
    </>
  );
}

function DetailHeadline({
  session,
  collectedTotal,
}: {
  session: SessionRow;
  collectedTotal: number;
}): ReactElement {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
        Route detail
      </p>
      <CardTitle className="mt-1 text-base">{session.routeName}</CardTitle>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatSessionDate(session.sessionDate)} &middot;{" "}
        <span className="font-[family-name:var(--font-mono)] font-medium tabular-nums text-foreground">
          {visitRate(session.visitedStores, session.totalStores)}
        </span>{" "}
        of stops covered
        {collectedTotal > 0 ? (
          <>
            {" "}
            &middot;{" "}
            <span className="font-[family-name:var(--font-mono)] font-medium tabular-nums text-primary">
              {formatCurrencyPHP(collectedTotal)}
            </span>{" "}
            collected
          </>
        ) : null}
      </p>
    </div>
  );
}

export function SessionDetail({ session }: { session: SessionRow }): ReactElement {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const payments = useSessionPayments(session.id);

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <DetailHeadline
          session={session}
          collectedTotal={payments.collectedTotal}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-2xl"
          onClick={() => setInventoryOpen(true)}
        >
          <ClipboardList className="h-4 w-4" />
          View inventory
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <StoreEntryList
          session={session}
          paymentsByStore={payments.paymentsByStore}
        />
      </CardContent>
      {inventoryOpen ? (
        <SessionInventoryModal
          session={session}
          onClose={() => setInventoryOpen(false)}
        />
      ) : null}
    </Card>
  );
}
