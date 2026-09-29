"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  approving: boolean;
  inventoryVerified: InventoryVerificationStatus;
  handleApproveInventory: () => Promise<void>;
} {
  const [rows, setRows] = useState<InventorySummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [approving, setApproving] = useState(false);
  const [inventoryVerified, setInventoryVerified] = useState(
    initialInventoryVerified,
  );

  const handleApproveInventory = async () => {
    setApproving(true);
    try {
      await approveInventory(sessionId);
      setInventoryVerified("verified");
      toast.success("Inventory Approved");
    } catch (err) {
      console.error(
        `Failed to approve inventory for session ${sessionId}`,
        err,
      );
    } finally {
      setApproving(false);
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

  return { rows, loading, approving, inventoryVerified, handleApproveInventory };
}
