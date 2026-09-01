"use client";

import { useEffect, useMemo, useState } from "react";

import { getSessionPayments } from "../services/getSessionPayments";
import { groupPaymentsBySessionStore } from "../core/groupPaymentsBySessionStore";
import { sumCollectedPayments } from "../core/sumCollectedPayments";
import type { SessionPaymentRow } from "../types/session-types";

export function useSessionPayments(sessionId: string): {
  paymentsByStore: Record<string, SessionPaymentRow[]>;
  collectedTotal: number;
} {
  const [payments, setPayments] = useState<SessionPaymentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSessionPayments(sessionId)
      .then((result) => {
        if (!cancelled) setPayments(result);
      })
      .catch((err) => {
        console.error(`Failed to load payments for session ${sessionId}`, err);
        if (!cancelled) setPayments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return {
    paymentsByStore: useMemo(
      () => groupPaymentsBySessionStore(payments),
      [payments],
    ),
    collectedTotal: sumCollectedPayments(payments),
  };
}
