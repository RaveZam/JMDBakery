export function RecordsHeader() {
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
