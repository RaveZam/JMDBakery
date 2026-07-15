export function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}
