import { getDb } from "@/src/lib/db";

export function getRouteName(routeId: string): string | null {
  const row = getDb().getFirstSync<{ name: string }>(
    `SELECT name FROM routes WHERE id = ?`,
    [routeId],
  );
  return row?.name ?? null;
}
