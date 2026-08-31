import { latestUpdatedAt } from "./latest-updated-at";

/**
 * Where the page walk resumes after a page has been applied, or null when it
 * should stop.
 *
 * Stops on a short page — that's the end of the changes. Also stops when a full
 * page failed to move the timestamp, which means more than a page's worth of
 * rows share one `updated_at`: walking on would re-read the same page forever,
 * so the run gives up and lets the next one try instead of spinning.
 *
 * @param page - The page that was just applied.
 * @param currentCursor - The cursor this page was fetched with.
 * @param pageSize - The row cap the page was requested with.
 * @returns The next cursor, or null to stop the walk.
 */
export function nextPageCursor(
  page: { updated_at: string }[],
  currentCursor: string | null,
  pageSize: number,
): string | null {
  if (page.length < pageSize) return null;

  const newest = latestUpdatedAt(page);
  if (newest === null || newest === currentCursor) return null;

  return newest;
}
