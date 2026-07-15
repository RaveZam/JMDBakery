"use client";

import { useEffect, useState } from "react";

import { getSessionInventory } from "../services/sessionsService";
import type { InventorySummaryRow } from "../types/session-types";

export function useSessionInventory(
  sessionId: string,
  open: boolean,
): {
  rows: InventorySummaryRow[];
  loading: boolean;
} {
  const [rows, setRows] = useState<InventorySummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    setLoading(true);
    getSessionInventory(sessionId)
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch((err) => {
        console.error(`Failed to load inventory for session ${sessionId}`, err);
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, loaded, sessionId]);

  return { rows, loading };
}
