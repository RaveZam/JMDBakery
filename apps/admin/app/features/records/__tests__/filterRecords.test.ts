import { describe, expect, test } from "vitest";
import { filterRecords, type RecordFilters } from "../helpers/filterRecords";
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

function filters(overrides: Partial<RecordFilters> = {}): RecordFilters {
  return { view: "all", search: "", ...overrides };
}

const soldOnly = makeRecord({ id: "sold", soldQty: 10, boQty: 0 });
const badOrderOnly = makeRecord({ id: "bad", soldQty: 0, boQty: 4 });
const split = makeRecord({ id: "split", soldQty: 6, boQty: 2 });
const empty = makeRecord({ id: "empty", soldQty: 0, boQty: 0 });

describe("filterRecords", () => {
  test("keeps every record on the 'all' view with no search", () => {
    const records = [soldOnly, badOrderOnly, split, empty];

    expect(filterRecords(records, filters())).toEqual(records);
  });

  test("keeps only records with sold units on the sales view", () => {
    const result = filterRecords(
      [soldOnly, badOrderOnly, split, empty],
      filters({ view: "sales" }),
    );

    expect(result.map((r) => r.id)).toEqual(["sold", "split"]);
  });

  test("keeps only records with bad-order units on the bad orders view", () => {
    const result = filterRecords(
      [soldOnly, badOrderOnly, split, empty],
      filters({ view: "bad-orders" }),
    );

    expect(result.map((r) => r.id)).toEqual(["bad", "split"]);
  });

  test("keeps credit records on the all view", () => {
    const cashRecord = makeRecord({ id: "cash", paymentType: "cash" });
    const creditRecord = makeRecord({ id: "credit", paymentType: "credit" });

    const result = filterRecords([cashRecord, creditRecord], filters());

    expect(result.map((r) => r.id)).toEqual(["cash", "credit"]);
  });

  test("drops credit records from the sales and bad orders views", () => {
    const cashRecord = makeRecord({ id: "cash", paymentType: "cash" });
    const creditRecord = makeRecord({ id: "credit", paymentType: "credit" });

    expect(
      filterRecords([cashRecord, creditRecord], filters({ view: "sales" })).map(
        (r) => r.id,
      ),
    ).toEqual(["cash"]);
    expect(
      filterRecords(
        [makeRecord({ id: "bad-credit", paymentType: "credit", soldQty: 0, boQty: 3 })],
        filters({ view: "bad-orders" }),
      ),
    ).toEqual([]);
  });

  test("keeps only credit records on the credits view", () => {
    const cashRecord = makeRecord({ id: "cash", paymentType: "cash" });
    const creditRecord = makeRecord({ id: "credit", paymentType: "credit" });

    const result = filterRecords([cashRecord, creditRecord], filters({ view: "credits" }));

    expect(result.map((r) => r.id)).toEqual(["credit"]);
  });

  test("matches the search against the store name only", () => {
    const records = [
      makeRecord({ id: "by-store", store: "Marites Sari-Sari" }),
      makeRecord({ id: "by-agent", agent: "Marites" }),
      makeRecord({ id: "by-province", province: "Marites Province" }),
      makeRecord({ id: "by-product", product: "Marites Bread" }),
    ];

    const result = filterRecords(records, filters({ search: "marites" }));

    expect(result.map((r) => r.id)).toEqual(["by-store"]);
  });

  test("matches partial text case-insensitively", () => {
    const records = [makeRecord({ id: "match", store: "Gaisano Grand Mall" })];

    expect(filterRecords(records, filters({ search: "GRAND" }))).toHaveLength(1);
  });

  test("ignores surrounding whitespace in the search", () => {
    const records = [makeRecord({ id: "match", store: "Ana Sari-Sari" })];

    expect(filterRecords(records, filters({ search: "   ana   " }))).toHaveLength(1);
  });

  test("treats a whitespace-only search as no search at all", () => {
    const records = [soldOnly, badOrderOnly];

    expect(filterRecords(records, filters({ search: "   " }))).toEqual(records);
  });

  test("applies the view and the search together", () => {
    const records = [
      makeRecord({ id: "sold-ana", store: "Ana Store", soldQty: 10, boQty: 0 }),
      makeRecord({ id: "bad-ana", store: "Ana Store", soldQty: 0, boQty: 3 }),
      makeRecord({ id: "bad-ben", store: "Ben Store", soldQty: 0, boQty: 3 }),
    ];

    const result = filterRecords(
      records,
      filters({ view: "bad-orders", search: "ana" }),
    );

    expect(result.map((r) => r.id)).toEqual(["bad-ana"]);
  });

  test("returns nothing when the search matches no record", () => {
    expect(filterRecords([soldOnly, badOrderOnly], filters({ search: "zzz" }))).toEqual(
      [],
    );
  });

  test("returns an empty list when given no records", () => {
    expect(filterRecords([], filters({ view: "sales", search: "ana" }))).toEqual([]);
  });

  test("narrows by province as a case-insensitive partial match", () => {
    const records = [
      makeRecord({ id: "cebu", province: "Cebu" }),
      makeRecord({ id: "davao", province: "Davao del Sur" }),
    ];

    const result = filterRecords(records, filters({ province: "davao" }));

    expect(result.map((r) => r.id)).toEqual(["davao"]);
  });

  test("narrows by agent as an exact match", () => {
    const records = [
      makeRecord({ id: "ana", agent: "Ana" }),
      makeRecord({ id: "anabelle", agent: "Anabelle" }),
    ];

    const result = filterRecords(records, filters({ agent: "Ana" }));

    expect(result.map((r) => r.id)).toEqual(["ana"]);
  });

  test("narrows by product as an exact match", () => {
    const records = [
      makeRecord({ id: "pandesal", product: "Pandesal" }),
      makeRecord({ id: "monay", product: "Monay" }),
    ];

    const result = filterRecords(records, filters({ product: "Monay" }));

    expect(result.map((r) => r.id)).toEqual(["monay"]);
  });

  test("combines province, agent, and product filters", () => {
    const match = makeRecord({
      id: "match",
      province: "Cebu",
      agent: "Ana",
      product: "Pandesal",
    });
    const wrongAgent = makeRecord({
      id: "wrong-agent",
      province: "Cebu",
      agent: "Ben",
      product: "Pandesal",
    });

    const result = filterRecords(
      [match, wrongAgent],
      filters({ province: "cebu", agent: "Ana", product: "Pandesal" }),
    );

    expect(result.map((r) => r.id)).toEqual(["match"]);
  });
});
