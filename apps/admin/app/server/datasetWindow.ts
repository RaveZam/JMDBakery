const DATASET_WINDOW_MONTHS = 1;

const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * The oldest date the Records/Dashboard datasets reach back to, as YYYY-MM-DD.
 * Sales and credit payments share it so both tabs describe the same window.
 */
export function windowStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - DATASET_WINDOW_MONTHS);
  return d.toISOString().slice(0, 10);
}

/**
 * The Philippine calendar day a timestamp falls on, as YYYY-MM-DD.
 * The server is not on Manila time, so a 7am collection is the previous day in
 * UTC and would list a day early beside sales, which carry a real session_date.
 */
export function manilaDateKey(timestamp: string): string {
  return new Date(Date.parse(timestamp) + PH_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}
