import {
  ALL_AGENTS,
  ALL_SESSIONS,
  type RecordsFilters,
} from "@/lib/selectors/filters";
import type { LedgerRecord } from "@/app/features/records/types";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function filterRecords(
  records: LedgerRecord[],
  filters: RecordsFilters,
): LedgerRecord[] {

  return records.filter((r) => {
    if (filters.agent !== ALL_AGENTS && r.agent !== filters.agent) return false;
    if (filters.sessionId !== ALL_SESSIONS && r.sessionId !== filters.sessionId)
      return false;
    return true;
  });
}

function searchRecords(
  records: LedgerRecord[],
  q: string,
): LedgerRecord[] {
  if (!q) return records;
  return records.filter(
    (r) =>
      r.store.toLowerCase().includes(q) ||
      r.product.toLowerCase().includes(q),
  );
}

export type RecordsPageTotals = {
  soldQty: number;
  boQty: number;
  lineTotal: number;
};

export type RecordsPageData = {
  agents: string[];
  filters: RecordsFilters;
  rows: LedgerRecord[];
  totals: RecordsPageTotals;
  page: number;
  totalPages: number;
  rowCount: number;
  rawQuery: string;
};

function sumTotals(records: LedgerRecord[]): RecordsPageTotals {
  let soldQty = 0;
  let boQty = 0;
  let lineTotal = 0;
  for (const r of records) {
    soldQty += r.soldQty;
    boQty += r.boQty;
    lineTotal += r.lineTotal;
  }
  return { soldQty, boQty, lineTotal };
}

export function getRecordsPageData(
  records: LedgerRecord[],
  filters: RecordsFilters,
  sp: SearchParams,
  pageSize = 25,
): RecordsPageData {
  const agents = Array.from(new Set(records.map((r) => r.agent))).sort();
  const rawQuery = (firstParam(sp, "q") ?? "").trim();
  const rawPage = Number(firstParam(sp, "page") ?? "1");
  const requestedPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const filtered = filterRecords(records, filters);
  const searched = searchRecords(filtered, rawQuery.toLowerCase());

  const totalPages = Math.max(1, Math.ceil(searched.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const rows = searched.slice((page - 1) * pageSize, page * pageSize);

  return {
    agents,
    filters,
    rows,
    totals: sumTotals(searched),
    page,
    totalPages,
    rowCount: searched.length,
    rawQuery,
  };
}

export function buildRecordsPageUrl(
  sp: SearchParams,
  next: Record<string, string | null>,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "date") continue;
    const value = Array.isArray(v) ? v[0] : v;
    if (typeof value === "string" && value.length) params.set(k, value);
  }
  for (const [k, v] of Object.entries(next)) {
    if (!v) params.delete(k);
    else params.set(k, v);
  }
  return `/records?${params.toString()}`;
}
