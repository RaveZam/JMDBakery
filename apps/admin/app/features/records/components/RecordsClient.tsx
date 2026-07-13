"use client";

import { useMemo, type ReactElement } from "react";
import Link from "next/link";

import { RecordsToolbar } from "@/app/features/records/components/RecordsToolbar";
import { RecordsFiltersBar } from "@/app/features/records/components/RecordsFiltersBar";
import { formatCurrencyPHP } from "@/lib/utils";
import {
  buildRecordsPageUrl,
  getRecordsPageData,
} from "@/app/features/records/server/records-page-data";
import type { RouteSession } from "@/app/features/records/server/fetch-sessions";
import type { LedgerRecord } from "@/app/features/records/types";
import { parseRecordsFilters } from "@/lib/selectors/filters";
import { useSalesData } from "@/app/features/sales-data/SalesDataProvider";
import type { SalesRecord } from "@/app/server/getBaseData";

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  sessions: RouteSession[];
  sp: SearchParams;
};

function toRecords(raw: SalesRecord[]): LedgerRecord[] {
  return raw.map((r) => ({
    ...r,
    lineTotal: r.soldQty * r.unitPrice,
  }));
}

export function RecordsClient({ sessions, sp }: Props): ReactElement {
  const { data: allData } = useSalesData();
  const filters = parseRecordsFilters(sp);

  const data = useMemo(() => {
    const records = toRecords(allData).filter(
      (r) => r.date >= filters.dateFrom && r.date <= filters.dateTo,
    );
    return getRecordsPageData(records, filters, sp);
  }, [allData, sp, filters]);

  const buildUrl = buildRecordsPageUrl;
  const { agents, rows, totals, page, totalPages, rowCount, rawQuery } = data;

  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Records</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Master Ledger (Phase 1). Read-only.
            </p>
          </div>
          <div className="space-y-4">
            <RecordsFiltersBar
              agents={agents}
              sessions={sessions}
              filtersDefault={filters}
            />
            <RecordsToolbar defaultQuery={rawQuery} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-[1200px] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{rowCount}</span>{" "}
              records
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={buildUrl(sp, { page: String(Math.max(1, page - 1)) })}
                className={`rounded-xl border px-3 py-2 ${
                  page <= 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                Prev
              </Link>
              <span className="text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span>{" "}
                / {totalPages}
              </span>
              <Link
                href={buildUrl(sp, { page: String(Math.min(totalPages, page + 1)) })}
                className={`rounded-xl border px-3 py-2 ${
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-muted"
                }`}
              >
                Next
              </Link>
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border bg-card shadow-soft">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 text-xs text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-3 text-left font-medium">Date</th>
                  <th className="px-3 py-3 text-left font-medium">Agent</th>
                  <th className="px-3 py-3 text-left font-medium">Store</th>
                  <th className="px-3 py-3 text-left font-medium">Product</th>
                  <th className="px-3 py-3 text-right font-medium">Sold</th>
                  <th className="px-3 py-3 text-right font-medium">BO</th>
                  <th className="px-3 py-3 text-right font-medium">Unit ₱</th>
                  <th className="px-3 py-3 text-right font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 tabular-nums">{r.date}</td>
                      <td className="px-3 py-2">{r.agent}</td>
                      <td className="px-3 py-2">{r.store}</td>
                      <td className="px-3 py-2">{r.product}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.soldQty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.boQty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrencyPHP(r.unitPrice)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrencyPHP(r.lineTotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                      No records for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td className="px-3 py-3 text-xs font-medium text-muted-foreground" colSpan={4}>
                    Totals
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-semibold tabular-nums">{totals.soldQty}</td>
                  <td className="px-3 py-3 text-right text-sm font-semibold tabular-nums">{totals.boQty}</td>
                  <td className="px-3 py-3" />
                  <td className="px-3 py-3 text-right text-sm font-semibold tabular-nums">{formatCurrencyPHP(totals.lineTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
