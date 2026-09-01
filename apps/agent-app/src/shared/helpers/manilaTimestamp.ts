import { manilaDateKey } from "./manilaDateKey";

const manilaTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function pad3(milliseconds: number): string {
  return String(milliseconds).padStart(3, "0");
}

/**
 * The Philippine wall clock right now, as YYYY-MM-DDTHH:mm:ss.sss.
 *
 * This is what every created_at in the app is written with. It deliberately
 * carries no timezone suffix: the value is a Manila reading, and the admin site
 * displays those digits as-is rather than converting them.
 *
 * Milliseconds come straight off the Date because they don't vary by timezone.
 *
 * @param now - The instant to read; defaults to the current time.
 * @returns The Manila wall clock, e.g. "2026-09-01T10:18:30.500".
 */
export function manilaTimestamp(now: Date = new Date()): string {
  const time = manilaTimeFormat.format(now);
  return `${manilaDateKey(now)}T${time}.${pad3(now.getMilliseconds())}`;
}
