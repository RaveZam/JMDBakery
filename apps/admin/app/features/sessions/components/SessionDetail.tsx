"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useSessionPayments } from "../hooks/useSessionPayments";
import type { SessionRow } from "../types/session-types";
import { SessionDetailHeader } from "./SessionDetailHeader";
import { SessionInventoryModal } from "./SessionInventoryModal";
import { StoreEntryList } from "./StoreEntryList";

export function SessionDetail({
  session,
}: {
  session: SessionRow;
}): ReactElement {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const payments = useSessionPayments(session.id);

  return (
    <Card className="border-border/70 shadow-soft dark:shadow-soft-dark">
      <SessionDetailHeader
        session={session}
        collectedTotal={payments.collectedTotal}
        onViewInventory={() => setInventoryOpen(true)}
      />
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
