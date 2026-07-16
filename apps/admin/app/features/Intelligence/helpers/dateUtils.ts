const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Current time shifted to Philippines local time (UTC+8), regardless of server TZ. */
export function nowInManila(): Date {
  return new Date(Date.now() + PH_OFFSET_MS);
}

export function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
