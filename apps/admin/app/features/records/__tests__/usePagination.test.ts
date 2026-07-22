import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { usePagination } from "../hooks/usePagination";
import type { SalesRecord } from "@/app/server/salesData/getBaseData";

function makeRecord(id: string): SalesRecord {
  return {
    id,
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
  };
}

function makeRecords(count: number): SalesRecord[] {
  return Array.from({ length: count }, (_, index) => makeRecord(`r${index + 1}`));
}

describe("usePagination", () => {
  test("starts on the first page", () => {
    const { result } = renderHook(() => usePagination(makeRecords(7), 3, "all:"));

    expect(result.current.page).toBe(1);
    expect(result.current.pageRecords.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  test("reports the number of pages needed for the records", () => {
    const { result } = renderHook(() => usePagination(makeRecords(7), 3, "all:"));

    expect(result.current.totalPages).toBe(3);
  });

  test("reports one page when there are no records", () => {
    const { result } = renderHook(() => usePagination([], 3, "all:"));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageRecords).toEqual([]);
  });

  test("serves the matching slice after moving to another page", () => {
    const { result } = renderHook(() => usePagination(makeRecords(7), 3, "all:"));

    act(() => result.current.setPage(3));

    expect(result.current.page).toBe(3);
    expect(result.current.pageRecords.map((r) => r.id)).toEqual(["r7"]);
  });

  test("clamps back to the last page when the record list shrinks under it", () => {
    const { result, rerender } = renderHook(
      ({ records }) => usePagination(records, 3, "all:"),
      { initialProps: { records: makeRecords(7) } },
    );

    act(() => result.current.setPage(3));
    rerender({ records: makeRecords(4) });

    expect(result.current.page).toBe(2);
    expect(result.current.pageRecords.map((r) => r.id)).toEqual(["r4"]);
  });

  test("returns to the first page when the reset key changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => usePagination(makeRecords(7), 3, resetKey),
      { initialProps: { resetKey: "all:" } },
    );

    act(() => result.current.setPage(3));
    rerender({ resetKey: "sales:" });

    expect(result.current.page).toBe(1);
    expect(result.current.pageRecords.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  test("stays on the current page while the reset key is unchanged", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => usePagination(makeRecords(7), 3, resetKey),
      { initialProps: { resetKey: "all:" } },
    );

    act(() => result.current.setPage(2));
    rerender({ resetKey: "all:" });

    expect(result.current.page).toBe(2);
  });
});
