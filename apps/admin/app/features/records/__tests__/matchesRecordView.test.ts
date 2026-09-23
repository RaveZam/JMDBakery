import { describe, expect, test } from "vitest";
import { matchesRecordView } from "../helpers/matchesRecordView";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

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

describe("matchesRecordView", () => {
  test("all view keeps cash and credit rows regardless of quantities", () => {
    expect(matchesRecordView(makeRecord({ paymentType: "cash" }), "all")).toBe(true);
    expect(matchesRecordView(makeRecord({ paymentType: "credit" }), "all")).toBe(true);
    expect(
      matchesRecordView(makeRecord({ soldQty: 0, boQty: 0 }), "all"),
    ).toBe(true);
  });

  test("sales view keeps only cash rows with sold units", () => {
    expect(matchesRecordView(makeRecord({ soldQty: 10, boQty: 0 }), "sales")).toBe(true);
    expect(matchesRecordView(makeRecord({ soldQty: 0, boQty: 4 }), "sales")).toBe(false);
    expect(
      matchesRecordView(makeRecord({ soldQty: 10, paymentType: "credit" }), "sales"),
    ).toBe(false);
  });

  test("bad-orders view keeps only cash rows with bad-order units", () => {
    expect(
      matchesRecordView(makeRecord({ soldQty: 0, boQty: 4 }), "bad-orders"),
    ).toBe(true);
    expect(
      matchesRecordView(makeRecord({ soldQty: 10, boQty: 0 }), "bad-orders"),
    ).toBe(false);
    expect(
      matchesRecordView(makeRecord({ boQty: 4, paymentType: "credit" }), "bad-orders"),
    ).toBe(false);
  });

  test("credits view keeps only credit rows", () => {
    expect(matchesRecordView(makeRecord({ paymentType: "credit" }), "credits")).toBe(
      true,
    );
    expect(matchesRecordView(makeRecord({ paymentType: "cash" }), "credits")).toBe(
      false,
    );
  });
});
