import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useRecordsFilter } from "../hooks/useRecordsFilter";
import { RECORDS_PAGE_SIZE } from "../types";
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

const soldOnly = makeRecord({
  id: "sold",
  agent: "Ana",
  store: "Ana Sari-Sari",
  soldQty: 10,
  boQty: 0,
});
const badOrderOnly = makeRecord({
  id: "bad",
  agent: "Ben",
  store: "Ben Grocery",
  soldQty: 0,
  boQty: 4,
});
const split = makeRecord({
  id: "split",
  agent: "Ana",
  store: "Ana Sari-Sari",
  soldQty: 6,
  boQty: 2,
});

const allRecords = [soldOnly, badOrderOnly, split];

describe("useRecordsFilter", () => {
  test("starts on the all view with every filter empty", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    expect(result.current.filters.view).toBe("all");
    expect(result.current.filters.search).toBe("");
    expect(result.current.filters.province).toBe("");
    expect(result.current.filters.agent).toBe("");
    expect(result.current.filters.product).toBe("");
    expect(result.current.records).toEqual(allRecords);
  });

  test("narrows the records when the view changes", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setView("bad-orders"));

    expect(result.current.records.map((r) => r.id)).toEqual(["bad", "split"]);
  });

  test("narrows the records when the search changes", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setSearch("ana"));

    expect(result.current.records.map((r) => r.id)).toEqual(["sold", "split"]);
  });

  test("narrows the records when the agent filter changes", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setAgent("Ben"));

    expect(result.current.records.map((r) => r.id)).toEqual(["bad"]);
  });

  test("narrows the records when the product filter changes", () => {
    const monay = makeRecord({ id: "monay", product: "Monay" });
    const { result } = renderHook(() =>
      useRecordsFilter([...allRecords, monay], "", ""),
    );

    act(() => result.current.filters.setProduct("Monay"));

    expect(result.current.records.map((r) => r.id)).toEqual(["monay"]);
  });

  test("narrows the records when the province filter changes", () => {
    const davao = makeRecord({ id: "davao", province: "Davao del Sur" });
    const { result } = renderHook(() =>
      useRecordsFilter([...allRecords, davao], "", ""),
    );

    act(() => result.current.filters.setProvince("davao"));

    expect(result.current.records.map((r) => r.id)).toEqual(["davao"]);
  });

  test("derives sorted, deduplicated agent and product dropdown options", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    expect(result.current.filters.agentOptions).toEqual(["Ana", "Ben"]);
    expect(result.current.filters.productOptions).toEqual(["Pandesal"]);
  });

  test("summarises the whole dataset, not just the open view", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setView("bad-orders"));

    expect(result.current.summary.totalRecords).toBe(3);
    expect(result.current.summary.totalSoldQty).toBe(16);
    expect(result.current.summary.totalBoQty).toBe(6);
  });

  test("summarises only what the search matches", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setSearch("ana"));

    expect(result.current.summary.totalRecords).toBe(2);
  });

  test("lists credit rows on the all view and keeps their total in the summary", () => {
    const creditRecord = makeRecord({
      id: "credit",
      paymentType: "credit",
      total: 250,
    });

    const { result } = renderHook(() =>
      useRecordsFilter([...allRecords, creditRecord], "", ""),
    );

    expect(result.current.records.map((r) => r.id)).toEqual([
      "sold",
      "bad",
      "split",
      "credit",
    ]);
    expect(result.current.summary.creditTotal).toBe(250);
  });

  test("returns the first page of results", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords, "", ""));

    expect(result.current.pageRecords).toHaveLength(RECORDS_PAGE_SIZE);
    expect(result.current.pagination.totalPages).toBe(2);
    expect(result.current.pagination.page).toBe(1);
  });

  test("returns to the first page when the view changes", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords, "", ""));
    act(() => result.current.pagination.setPage(2));
    expect(result.current.pagination.page).toBe(2);

    act(() => result.current.filters.setView("sales"));

    expect(result.current.pagination.page).toBe(1);
  });

  test("returns to the first page when the search changes", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords, "", ""));
    act(() => result.current.pagination.setPage(2));

    act(() => result.current.filters.setSearch("ana"));

    expect(result.current.pagination.page).toBe(1);
  });

  test("reports an empty result set when nothing matches", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords, "", ""));

    act(() => result.current.filters.setSearch("zzz"));

    expect(result.current.records).toEqual([]);
    expect(result.current.pageRecords).toEqual([]);
    expect(result.current.pagination.totalPages).toBe(1);
    expect(result.current.summary.totalRecords).toBe(0);
  });
});
