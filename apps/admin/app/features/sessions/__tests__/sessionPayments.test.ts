import { describe, expect, test } from "vitest";
import { groupPaymentsBySessionStore } from "../core/groupPaymentsBySessionStore";
import { sumCollectedPayments } from "../core/sumCollectedPayments";
import type { SessionPaymentRow } from "../types/session-types";

function payment(
  id: string,
  sessionStoreId: string,
  amount: number,
): SessionPaymentRow {
  return {
    id,
    sessionStoreId,
    amount,
    note: null,
    recordedByName: null,
    createdAt: "2026-09-01T01:00:00Z",
  };
}

describe("groupPaymentsBySessionStore", () => {
  test("keys each payment by the visit it was collected on", () => {
    const grouped = groupPaymentsBySessionStore([
      payment("p1", "visit-a", 100),
      payment("p2", "visit-b", 50),
      payment("p3", "visit-a", 25),
    ]);

    expect(grouped["visit-a"].map((p) => p.id)).toEqual(["p1", "p3"]);
    expect(grouped["visit-b"].map((p) => p.id)).toEqual(["p2"]);
  });

  test("returns an empty map when there are no payments", () => {
    expect(groupPaymentsBySessionStore([])).toEqual({});
  });
});

describe("sumCollectedPayments", () => {
  test("adds up every payment amount", () => {
    expect(
      sumCollectedPayments([
        payment("p1", "visit-a", 100),
        payment("p2", "visit-b", 50.5),
      ]),
    ).toBe(150.5);
  });

  test("is zero when nothing was collected", () => {
    expect(sumCollectedPayments([])).toBe(0);
  });
});
