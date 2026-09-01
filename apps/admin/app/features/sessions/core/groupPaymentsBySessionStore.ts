import type { SessionPaymentRow } from "../types/session-types";

// Payments keyed by the visit they were collected on, so a store row can pick
// up its own without scanning the whole list.
export function groupPaymentsBySessionStore(
  payments: SessionPaymentRow[],
): Record<string, SessionPaymentRow[]> {
  const grouped: Record<string, SessionPaymentRow[]> = {};
  for (const payment of payments) {
    grouped[payment.sessionStoreId] = [
      ...(grouped[payment.sessionStoreId] ?? []),
      payment,
    ];
  }
  return grouped;
}
