const COLUMNS = [
  "Date",
  "Store",
  "Province",
  "Collected by",
  "Encoded by",
  "Note",
];

export function PaymentsTableHeader() {
  return (
    <thead className="sticky top-0 z-10 bg-card">
      <tr className="border-b border-border/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
        <th className="w-1" />
        {COLUMNS.map((col) => (
          <th key={col} className="px-4 py-3 font-medium">
            {col}
          </th>
        ))}
        <th className="px-4 py-3 text-right font-medium">Amount</th>
      </tr>
    </thead>
  );
}
