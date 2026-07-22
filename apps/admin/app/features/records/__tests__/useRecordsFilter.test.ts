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
    ...overrides,
  };
}

const soldOnly = makeRecord({ id: "sold", agent: "Ana", soldQty: 10, boQty: 0 });
const badOrderOnly = makeRecord({ id: "bad", agent: "Ben", soldQty: 0, boQty: 4 });
const split = makeRecord({ id: "split", agent: "Ana", soldQty: 6, boQty: 2 });

const allRecords = [soldOnly, badOrderOnly, split];

describe("useRecordsFilter", () => {
  test("starts on the all view with an empty search", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords));

    expect(result.current.view).toBe("all");
    expect(result.current.search).toBe("");
    expect(result.current.records).toEqual(allRecords);
  });

  test("narrows the records when the view changes", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords));

    act(() => result.current.setView("bad-orders"));

    expect(result.current.records.map((r) => r.id)).toEqual(["bad", "split"]);
  });

  test("narrows the records when the search changes", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords));

    act(() => result.current.setSearch("ana"));

    expect(result.current.records.map((r) => r.id)).toEqual(["sold", "split"]);
  });

  test("summarises the filtered records, not every record", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords));

    act(() => result.current.setView("bad-orders"));

    expect(result.current.summary.totalRecords).toBe(2);
    expect(result.current.summary.totalSoldQty).toBe(6);
    expect(result.current.summary.totalBoQty).toBe(6);
  });

  test("returns the first page of results", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords));

    expect(result.current.pageRecords).toHaveLength(RECORDS_PAGE_SIZE);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.page).toBe(1);
  });

  test("returns to the first page when the view changes", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords));
    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);

    act(() => result.current.setView("sales"));

    expect(result.current.page).toBe(1);
  });

  test("returns to the first page when the search changes", () => {
    const manyRecords = Array.from({ length: RECORDS_PAGE_SIZE + 20 }, (_, index) =>
      makeRecord({ id: `r${index + 1}` }),
    );

    const { result } = renderHook(() => useRecordsFilter(manyRecords));
    act(() => result.current.setPage(2));

    act(() => result.current.setSearch("ana"));

    expect(result.current.page).toBe(1);
  });

  test("reports an empty result set when nothing matches", () => {
    const { result } = renderHook(() => useRecordsFilter(allRecords));

    act(() => result.current.setSearch("zzz"));

    expect(result.current.records).toEqual([]);
    expect(result.current.pageRecords).toEqual([]);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.summary.totalRecords).toBe(0);
  });
});
