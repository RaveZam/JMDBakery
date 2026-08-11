import { describe, expect, test } from "vitest";
import { computeProductBoRate } from "../computeProductBoRate";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(overrides: Partial<SalesRecord> = {}): SalesRecord {
  return {
    id: "sale-1",
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

describe("computeProductBoRate", () => {
  test("groups by product, not agent or store", () => {
    const records = [
      makeRecord({ product: "Pandesal", agent: "Ana", soldQty: 80, boQty: 20 }),
      makeRecord({ product: "Pandesal", agent: "Ben", soldQty: 80, boQty: 0 }),
      makeRecord({ product: "Ensaymada", soldQty: 100, boQty: 0 }),
    ];

    const rows = computeProductBoRate(records);

    expect(rows.map((r) => r.key).sort()).toEqual(["Ensaymada", "Pandesal"]);
    const pandesal = rows.find((r) => r.key === "Pandesal");
    expect(pandesal).toEqual({
      key: "Pandesal",
      sold: 160,
      bo: 20,
      boRatePct: (20 / 180) * 100,
    });
  });
});
