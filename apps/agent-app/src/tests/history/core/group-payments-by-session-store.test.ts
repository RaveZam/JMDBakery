import { groupPaymentsBySessionStore } from "@/src/features/history/core/group-payments-by-session-store";
import type { StoreCreditEntryRow } from "@/src/lib/dao/store-credit-dao";

function payment(
  id: string,
  sessionStoreId: string | null,
  amount: number,
): StoreCreditEntryRow {
  return {
    id,
    store_id: "store-9",
    session_store_id: sessionStoreId,
    entry_type: "payment",
    amount,
    note: null,
    recorded_by: "agent-1",
    recorded_by_name: "Raven",
    created_at: "2026-08-03T01:00:00.000Z",
  };
}

test("keys each payment by the visit it was collected on", () => {
  const grouped = groupPaymentsBySessionStore([
    payment("a", "visit-1", 300),
    payment("b", "visit-2", 500),
  ]);

  expect(grouped["visit-1"]).toEqual([payment("a", "visit-1", 300)]);
  expect(grouped["visit-2"]).toEqual([payment("b", "visit-2", 500)]);
});

test("keeps every payment of a visit that was paid twice", () => {
  const grouped = groupPaymentsBySessionStore([
    payment("a", "visit-1", 300),
    payment("b", "visit-1", 200),
  ]);

  expect(grouped["visit-1"]).toHaveLength(2);
});

test("drops a payment with no visit on it, which no store card can show", () => {
  const grouped = groupPaymentsBySessionStore([payment("a", null, 300)]);

  expect(grouped).toEqual({});
});
