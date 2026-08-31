import { describe, expect, test } from "vitest";
import { summarizeCreditEntries } from "../core/summarizeCreditEntries";
import type { CreditLedgerEntry } from "../types/store-types";

function makeEntry(overrides: Partial<CreditLedgerEntry> = {}): CreditLedgerEntry {
  return {
    id: "entry-1",
    entryType: "credit",
    amount: 100,
    note: null,
    recordedByName: "Ana",
    tenderedByName: "Ana",
    createdAt: "2026-07-15T09:00:00Z",
    ...overrides,
  };
}

describe("summarizeCreditEntries", () => {
  test("sums credit and payment amounts, derives balance and last payment", () => {
    const entries = [
      makeEntry({ entryType: "credit", amount: 5900, createdAt: "2026-08-08T02:40:00Z" }),
      makeEntry({ entryType: "payment", amount: 3500, createdAt: "2026-08-10T09:15:00Z" }),
      makeEntry({ entryType: "payment", amount: 4750, createdAt: "2026-08-05T08:05:00Z" }),
    ];

    expect(summarizeCreditEntries(entries)).toEqual({
      creditTaken: 5900,
      paidBack: 8250,
      balance: 5900 - 8250,
      lastPaymentAt: "2026-08-10T09:15:00Z",
    });
  });

  test("empty ledger returns zeros and no last payment", () => {
    expect(summarizeCreditEntries([])).toEqual({
      creditTaken: 0,
      paidBack: 0,
      balance: 0,
      lastPaymentAt: null,
    });
  });

  test("credit-only ledger has no last payment", () => {
    const entries = [makeEntry({ entryType: "credit", amount: 1000 })];

    expect(summarizeCreditEntries(entries)).toEqual({
      creditTaken: 1000,
      paidBack: 0,
      balance: 1000,
      lastPaymentAt: null,
    });
  });
});
