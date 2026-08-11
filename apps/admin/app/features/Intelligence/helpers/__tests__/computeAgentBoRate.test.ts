import { describe, expect, test } from "vitest";
import { computeAgentBoRate } from "../computeAgentBoRate";
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

describe("computeAgentBoRate", () => {
  test("groups by agent, not product or store", () => {
    const records = [
      makeRecord({ agent: "Ana", product: "Pandesal", soldQty: 80, boQty: 20 }),
      makeRecord({ agent: "Ana", product: "Ensaymada", soldQty: 80, boQty: 0 }),
      makeRecord({ agent: "Ben", soldQty: 100, boQty: 0 }),
    ];

    const rows = computeAgentBoRate(records);

    expect(rows.map((r) => r.key).sort()).toEqual(["Ana", "Ben"]);
    const ana = rows.find((r) => r.key === "Ana");
    expect(ana).toEqual({
      key: "Ana",
      sold: 160,
      bo: 20,
      boRatePct: (20 / 180) * 100,
    });
  });
});
