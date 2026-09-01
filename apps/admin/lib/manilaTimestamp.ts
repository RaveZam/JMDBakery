type Timestamp = string | null | undefined;

// The one place that knows the storage format. The agent app writes created_at
// as a Manila wall clock with no real timezone (`2026-09-01T10:18:30.500`), so
// the digits are read directly. Passing the whole value to `new Date()` would
// treat it as UTC and re-render it in the viewer's timezone, moving evening
// entries to the next day and after-midnight ones to the previous.
function localMidnight(timestamp: Timestamp): Date | null {
  const day = manilaTimestamp.day(timestamp);
  return day ? new Date(`${day}T00:00:00`) : null;
}

/**
 * Reads Manila wall-clock timestamps written by the agent app.
 *
 * Every part of the admin app that needs a day, a time or an ordering out of a
 * `created_at` goes through here, so the storage format is described in exactly
 * one place. Each function returns "" (or null, for `hour`) when there is
 * nothing to read, so callers never have to guard first.
 */
export const manilaTimestamp = {
  /** The calendar day, as "2026-09-01". */
  day(timestamp: Timestamp): string {
    return timestamp ? timestamp.slice(0, 10) : "";
  },

  /** The day as "Sep 1". */
  dayShort(timestamp: Timestamp): string {
    return (
      localMidnight(timestamp)?.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }) ?? ""
    );
  },

  /** The day as "August 27, 2026". */
  dayLong(timestamp: Timestamp): string {
    return (
      localMidnight(timestamp)?.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) ?? ""
    );
  },

  /** The hour on a 24-hour clock, or null when there is no time part. */
  hour(timestamp: Timestamp): number | null {
    if (!timestamp || timestamp.length < 16) return null;
    const hour = Number(timestamp.slice(11, 13));
    return Number.isNaN(hour) ? null : hour;
  },

  /** The time as "10:01 AM". */
  time(timestamp: Timestamp): string {
    const hour24 = manilaTimestamp.hour(timestamp);
    if (hour24 === null) return "";

    const minute = timestamp!.slice(14, 16);
    // 0 and 12 both read as 12 on a 12-hour clock.
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minute} ${hour24 < 12 ? "AM" : "PM"}`;
  },

  /**
   * A key that sorts chronologically as plain text. The timezone suffix is
   * dropped so values that carry one line up with values that don't.
   */
  sortKey(timestamp: Timestamp): string {
    return timestamp ? timestamp.slice(0, 23) : "";
  },
};
