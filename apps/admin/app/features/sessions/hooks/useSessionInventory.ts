"use client";

import { useEffect, useState } from "react";

import {
  approveInventory,
  getSessionInventory,
} from "../services/sessionsService";
import type {
  InventorySummaryRow,
  InventoryVerificationStatus,
} from "../types/session-types";

export function useSessionInventory(
  sessionId: string,
  open: boolean,
  initialInventoryVerified: InventoryVerificationStatus,
): {
  rows: InventorySummaryRow[];
  loading: boolean;
  inventoryVerified: InventoryVerificationStatus;
  handleApproveInventory: () => Promise<void>;
} {
  const [rows, setRows] = useState<InventorySummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [inventoryVerified, setInventoryVerified] = useState(
    initialInventoryVerified,
  );

  const handleApproveInventory = async () => {
    try {
      await approveInventory(sessionId);
      setInventoryVerified("verified");
    } catch (err) {
      console.error(
        `Failed to approve inventory for session ${sessionId}`,
        err,
      );
    }
  };

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

  return { rows, loading, inventoryVerified, handleApproveInventory };
}
