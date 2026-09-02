import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { computeIntelligenceKpis } from "../kpis";
import { nowInManila, addDays, toDateKey } from "../dateUtils";
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

describe("computeIntelligenceKpis", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T04:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("computes today vs yesterday revenue and the percent change", () => {
    const today = toDateKey(nowInManila());
    const yesterday = toDateKey(addDays(nowInManila(), -1));
    const records = [
      makeRecord({ date: today, total: 150 }),
      makeRecord({ date: yesterday, total: 100 }),
    ];

    const kpis = computeIntelligenceKpis(records);

    expect(kpis.revenueToday).toBe(150);
    expect(kpis.revenueYesterday).toBe(100);
    expect(kpis.revenueChangePct).toBe(50);
  });

  test("leaves credit sale lines out of revenue but counts credit collected", () => {
    const today = toDateKey(nowInManila());
    const records = [
      makeRecord({ date: today, total: 150, paymentType: "cash" }),
      makeRecord({ date: today, total: 500, paymentType: "credit" }),
    ];
    const payments = [makePayment({ date: today, amount: 40 })];

    const kpis = computeIntelligenceKpis(records, payments);

    // 150 cash + 40 collected on old credit; the 500 credit order is not revenue yet.
    expect(kpis.revenueToday).toBe(190);
  });

  test("reports 0% change instead of dividing by zero when yesterday had no revenue", () => {
    const today = toDateKey(nowInManila());
    const records = [makeRecord({ date: today, total: 150 })];

    expect(computeIntelligenceKpis(records).revenueChangePct).toBe(0);
  });

  test("predicts tomorrow's revenue from the matching weekday and projects the next 7 days", () => {
    const now = nowInManila();
    // 7 distinct days, one per weekday, each with a unique revenue -- so
    // every weekday's average collapses to that single day's value.
    const records = Array.from({ length: 7 }, (_, i) =>
      makeRecord({ date: toDateKey(addDays(now, -i - 1)), total: (i + 1) * 10 }),
    );

    const kpis = computeIntelligenceKpis(records);

    const tomorrowWeekday = addDays(now, 1).getDay();
    const matchingRecord = records.find(
      (r) => new Date(r.date).getDay() === tomorrowWeekday,
    );
    expect(kpis.tomorrowWeekday).toBe(tomorrowWeekday);
    expect(kpis.predictedRevenueTomorrow).toBe(matchingRecord?.total ?? 0);

    const totalRevenue = records.reduce((sum, r) => sum + r.total, 0);
    expect(kpis.projectedRevenueNext7Days).toBe(totalRevenue);
  });

  test("computes the backorder rate as bo / sold", () => {
    const records = [makeRecord({ soldQty: 80, boQty: 20 })];

    expect(computeIntelligenceKpis(records).backorderRatePct).toBe(25);
  });

  test("counts units from credit orders too, since those pieces still moved", () => {
    const records = [
      makeRecord({ soldQty: 40, boQty: 10, paymentType: "cash" }),
      makeRecord({ soldQty: 40, boQty: 10, paymentType: "credit" }),
    ];

    // bo / sold = 20 / 80; the credit row's units count the same as the cash row's.
    expect(computeIntelligenceKpis(records).backorderRatePct).toBe(25);
  });

  test.each([
    [0, "healthy"],
    [4, "healthy"],
    [5, "medium"],
    [9, "medium"],
    [10, "warning"],
    [19, "warning"],
    [20, "critical"],
    [100, "critical"],
  ])("classifies a %i%% backorder rate as %s", (boRatePct, expectedTone) => {
    // soldQty fixed at 100 so bo / sold * 100 lands exactly on boRatePct.
    const records = [makeRecord({ soldQty: 100, boQty: boRatePct })];

    expect(computeIntelligenceKpis(records).backorderRisk.tone).toBe(expectedTone);
  });

  test("returns zeroed kpis without dividing by zero when there are no records", () => {
    const kpis = computeIntelligenceKpis([]);

    expect(kpis.revenueToday).toBe(0);
    expect(kpis.revenueChangePct).toBe(0);
    expect(kpis.predictedRevenueTomorrow).toBe(0);
    expect(kpis.projectedRevenueNext7Days).toBe(0);
    expect(kpis.backorderRatePct).toBe(0);
    expect(kpis.backorderRisk.tone).toBe("healthy");
  });
});
