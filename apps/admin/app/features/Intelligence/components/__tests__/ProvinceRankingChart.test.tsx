import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProvinceRankingChart } from "../ProvinceRankingChart";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";
import type { CreditPayment } from "@/app/features/records/types";

function makePayment(overrides: Partial<CreditPayment> = {}): CreditPayment {
  return {
    id: "pay-1",
    date: "2026-07-15",
    createdAt: "2026-07-15T09:00:00Z",
    store: "Store A",
    province: "Cebu",
    collectedBy: "Ana",
    note: null,
    amount: 100,
    ...overrides,
  };
}

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

describe("ProvinceRankingChart", () => {
  test("shows an empty-state message with no records", () => {
    render(<ProvinceRankingChart records={[]} payments={[]} />);

    expect(screen.getByText("No data for this period.")).toBeTruthy();
  });

  test("ranks provinces by revenue, numbering strongest first", () => {
    const records = [
      makeRecord({ province: "Cebu", total: 100 }),
      makeRecord({ province: "Bohol", total: 300 }),
    ];

    render(<ProvinceRankingChart records={records} payments={[]} />);

    expect(screen.getByText("Bohol")).toBeTruthy();
    expect(screen.getByText("₱300")).toBeTruthy();
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("02")).toBeTruthy();
  });

  test("folds credit collected into each province's revenue", () => {
    const records = [makeRecord({ province: "Cebu", total: 100 })];
    const payments = [makePayment({ province: "Cebu", amount: 250 })];

    render(<ProvinceRankingChart records={records} payments={payments} />);

    expect(screen.getByText("₱350")).toBeTruthy();
  });
});
