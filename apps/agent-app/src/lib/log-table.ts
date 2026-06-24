/** Logs an array of objects as a formatted text table in the Metro console. */
export function logTable(label: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    console.log(`\n=== ${label} (0 rows) ===`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const widths = cols.map((col) =>
    Math.max(col.length, ...rows.map((r) => String(r[col] ?? "").length)),
  );

  const sep = "+-" + widths.map((w) => "-".repeat(w)).join("-+-") + "-+";
  const header =
    "| " + cols.map((col, i) => col.padEnd(widths[i])).join(" | ") + " |";

  const lines = [
    `\n=== ${label} (${rows.length} rows) ===`,
    sep,
    header,
    sep,
    ...rows.map(
      (row) =>
        "| " +
        cols
          .map((col, i) => String(row[col] ?? "").padEnd(widths[i]))
          .join(" | ") +
        " |",
    ),
    sep,
  ];

  console.log(lines.join("\n"));
}
