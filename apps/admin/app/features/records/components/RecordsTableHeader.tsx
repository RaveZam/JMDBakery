const COLUMNS = ["Date", "Agent", "Store", "Province", "Product"];

export function RecordsTableHeader() {
  return (
    <thead className="sticky top-0 z-10 bg-card">
      <tr className="border-b border-border/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
        <th className="w-1" />
        {COLUMNS.map((col) => (
          <th key={col} className="px-4 py-3 font-medium">
            {col}
          </th>
        ))}
        <th className="px-4 py-3 text-right font-medium">Sold</th>
        <th className="px-4 py-3 text-right font-medium">Bad Order</th>
        <th className="px-4 py-3 text-right font-medium">Unit Price</th>
        <th className="px-4 py-3 text-right font-medium">Total</th>
      </tr>
    </thead>
  );
}
