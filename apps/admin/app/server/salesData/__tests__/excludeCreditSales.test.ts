import { describe, expect, test } from "vitest";
import { excludeCreditSales } from "../excludeCreditSales";
import type { SalesRecord } from "../getBaseData";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "record-1",
    sessionId: "session-1",
    date: "2026-07-15",
    createdAt: "2026-07-15T09:00:00Z",
    agent: "Ana",
    store: "Store A",
    province: "Cebu",
    product: "Pandesal",
    soldQty: 10,
    boQty: 0,
    unitPrice: 10,
    total: 100,
    boReason: null,
    paymentType: "cash",
    ...overrides,
  };
}

describe("excludeCreditSales", () => {
  test("keeps cash rows and drops credit rows", () => {
    const records = [
      makeRecord({ id: "cash-1", paymentType: "cash" }),
      makeRecord({ id: "credit-1", paymentType: "credit" }),
      makeRecord({ id: "cash-2", paymentType: "cash" }),
    ];

    expect(excludeCreditSales(records).map((r) => r.id)).toEqual([
      "cash-1",
      "cash-2",
    ]);
  });

  test("returns an empty list when every row is on credit", () => {
    expect(excludeCreditSales([makeRecord({ paymentType: "credit" })])).toEqual(
      [],
    );
  });

  test("leaves the input array untouched", () => {
    const records = [makeRecord({ paymentType: "credit" })];

    excludeCreditSales(records);

    expect(records).toHaveLength(1);
  });

  test("returns an empty list when given no records", () => {
    expect(excludeCreditSales([])).toEqual([]);
  });
});
