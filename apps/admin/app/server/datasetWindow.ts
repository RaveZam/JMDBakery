const DATASET_WINDOW_MONTHS = 1;

/**
 * The oldest date the Records/Dashboard datasets reach back to, as YYYY-MM-DD.
 * Sales and credit payments share it so both tabs describe the same window.
 */
export function windowStartDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - DATASET_WINDOW_MONTHS);
  return d.toISOString().slice(0, 10);
}
