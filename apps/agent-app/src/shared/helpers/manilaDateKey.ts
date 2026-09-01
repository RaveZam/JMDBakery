// en-CA formats dates as YYYY-MM-DD, which is the shape we store.
const manilaDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The Philippine calendar day right now, as YYYY-MM-DD.
 *
 * Asks Intl for the day in Asia/Manila rather than shifting the clock by eight
 * hours, so the answer is the same whatever timezone the phone is set to.
 *
 * @param now - The instant to read; defaults to the current time.
 * @returns The Manila calendar day, e.g. "2026-09-01".
 */
export function manilaDateKey(now: Date = new Date()): string {
  return manilaDayFormat.format(now);
}
