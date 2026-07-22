import { describe, expect, test } from "vitest";
import { recordStatus } from "../helpers/recordStatus";
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
    ...overrides,
  };
}

describe("recordStatus", () => {
  test("marks a record with only sold units as a sale", () => {
    expect(recordStatus(makeRecord({ soldQty: 10, boQty: 0 }))).toBe("sale");
  });

  test("marks a record with only bad-order units as a bad order", () => {
    expect(recordStatus(makeRecord({ soldQty: 0, boQty: 4 }))).toBe("bad-order");
  });

  test("marks a record with both sold and bad-order units as split", () => {
    expect(recordStatus(makeRecord({ soldQty: 10, boQty: 4 }))).toBe("split");
  });

  test("marks a record with no units at all as none", () => {
    expect(recordStatus(makeRecord({ soldQty: 0, boQty: 0 }))).toBe("none");
  });
});
