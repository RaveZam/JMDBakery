"use client";

import { useEffect, useMemo, useState } from "react";

import { getSessionSales } from "../services/getSessionSales";
import { summarizeSessionSales } from "../core/summarizeSessionSales";
import type { SessionSaleRow, SessionSalesSummary } from "../types/session-types";

export function useSessionSalesSummary(sessionId: string): {
  summary: SessionSalesSummary;
  loading: boolean;
} {
  const [sales, setSales] = useState<SessionSaleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSessionSales(sessionId)
      .then((result) => {
        if (!cancelled) setSales(result);
      })
      .catch((err) => {
        console.error(`Failed to load sales for session ${sessionId}`, err);
        if (!cancelled) setSales([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return {
    summary: useMemo(() => summarizeSessionSales(sales), [sales]),
    loading,
  };
}
