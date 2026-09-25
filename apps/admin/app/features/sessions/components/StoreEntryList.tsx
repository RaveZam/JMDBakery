import { useState } from "react";
import type { ReactElement } from "react";

import { useSessionStores } from "../hooks/useSessionStores";
import type { SessionPaymentRow, SessionRow } from "../types/session-types";
import { StoreEntry } from "./StoreEntry";

function StatusMessage({ text }: { text: string }): ReactElement {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>
  );
}

export function StoreEntryList({
  session,
  paymentsByStore,
}: {
  session: SessionRow;
  paymentsByStore: Record<string, SessionPaymentRow[]>;
}): ReactElement {
  const { stores, loading } = useSessionStores(session.id);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  if (loading) return <StatusMessage text="Loading stores..." />;
  if (stores.length === 0) {
    return <StatusMessage text="No stores entered for this session." />;
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
