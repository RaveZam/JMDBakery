import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProductionRecommendations } from "../ProductionRecommendations";
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

describe("ProductionRecommendations", () => {
  test("shows the empty state when there is no sales history", () => {
    render(<ProductionRecommendations records={[]} />);

    expect(screen.getByText("No sales in the last 30 days")).toBeTruthy();
  });

  test("renders the recommendations table when there are records", () => {
    render(<ProductionRecommendations records={[makeRecord()]} />);

    expect(screen.queryByText("No sales in the last 30 days")).toBeNull();
    expect(screen.getByText("Pandesal")).toBeTruthy();
    expect(screen.getByText("Product")).toBeTruthy(); // table header
  });
});
