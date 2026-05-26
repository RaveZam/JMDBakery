"use client";

import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import type { SessionInventoryRow, SessionRow, SessionStoreRow } from "../types/session-types";
import { getSessionStores } from "../services/sessionsService";
import { getSessionInventory } from "../services/inventoryServices";
import { SessionCard } from "./SessionCard";
import { SessionStoreList } from "./SessionStoreList";

export function SessionsClient({
  sessions,
}: {
  sessions: SessionRow[];
}): ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stores, setStores] = useState<SessionStoreRow[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [inventory, setInventory] = useState<SessionInventoryRow[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(sessions.length / pageSize);
  const paginated = sessions.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [sessions]);

  async function handleSelect(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setStoresLoading(true);
    setInventoryLoading(true);
    try {
      const [storesResult, inventoryResult] = await Promise.all([
        getSessionStores(id),
        getSessionInventory(id),
      ]);
      setStores(storesResult);
      setInventory(inventoryResult);
    } finally {
      setStoresLoading(false);
      setInventoryLoading(false);
    }
  }

  const selected = sessions.find((s) => s.id === selectedId);

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="text-3xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Field activity monitor. Track agent route sessions.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px]">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <CalendarDays className="h-10 w-10 opacity-50" />
              <p className="text-sm">No sessions recorded yet.</p>
              <p className="text-xs">
                Sessions will appear here once agents start their routes.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-wider text-muted-foreground">
                  ALL SESSIONS ({sessions.length})
                </p>
                {paginated.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isSelected={session.id === selectedId}
                    onClick={() => handleSelect(session.id)}
                  />
                ))}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 text-sm disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 text-sm disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="xl:sticky xl:top-6 xl:self-start">
                {selectedId && selected ? (
                  <SessionStoreList
                    session={selected}
                    stores={stores}
                    loading={storesLoading}
                    inventory={inventory}
                    inventoryLoading={inventoryLoading}
                  />
                ) : (
                  <div className="hidden items-center justify-center rounded-2xl border border-dashed py-20 text-sm text-muted-foreground xl:flex">
                    Select a session to view store details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
