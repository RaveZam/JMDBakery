export function IntelligenceHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-slate-50/80 px-6 py-5 backdrop-blur dark:bg-background/80">
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Intelligence
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Health overview and revenue forecast
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
