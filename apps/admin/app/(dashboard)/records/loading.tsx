import type { ReactElement } from "react";

const COLUMN_COUNT = 10;

function LoadingHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-6 py-5 backdrop-blur">
      <div className="mx-auto w-full max-w-300">
        <div className="flex items-center gap-2.5">
          <span className="h-5 w-1 rounded-full bg-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Records</h1>
        </div>
        <p className="mt-1.5 pl-3.5 text-sm text-muted-foreground">
          The master ledger of every sale and bad order logged across your stores. Read-only.
        </p>
      </div>
    </header>
  );
}

function LoadingSummary(): ReactElement {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[92px] animate-pulse rounded-xl border border-border/70 bg-card"
        />
      ))}
    </div>
  );
}

function LoadingFilterBar(): ReactElement {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="h-11 w-72 animate-pulse rounded-xl border border-border/70 bg-card" />
      <div className="h-10 w-full max-w-xs animate-pulse rounded-xl border border-border/70 bg-card" />
    </div>
  );
}

function LoadingTable(): ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="h-3 w-full bg-border/70" />
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: 8 }).map((_, row) => (
            <tr key={row} className="border-b border-border/50 last:border-0">
              {Array.from({ length: COLUMN_COUNT }).map((__, col) => (
                <td key={col} className="px-4 py-3">
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Loading(): ReactElement {
  return (
    <>
      <LoadingHeader />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto w-full max-w-300 space-y-6">
          <LoadingSummary />
          <LoadingFilterBar />
          <LoadingTable />
        </div>
      </div>
    </>
  );
}
