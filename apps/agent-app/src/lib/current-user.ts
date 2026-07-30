import { SettingsDao } from "@/src/lib/dao/settings-dao";

const CURRENT_USER_KEY = "current_user_id";

/**
 * The signed-in agent's id, readable synchronously.
 *
 * `supabase.auth.getSession()` is async, but the SQLite reads that need to know
 * "did *this* agent register that store" are sync and run during render. The id
 * is written to the local DB at each auth check and read back from there, so it
 * is already correct on the launch after a sign-in — there is no window where a
 * screen renders before anyone has set it.
 */
let cachedUserId: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  cachedUserId = userId;
  SettingsDao.set(CURRENT_USER_KEY, userId);
}

/** Null only when nobody has signed in on this device yet. */
export function getCurrentUserId(): string | null {
  if (cachedUserId === null) cachedUserId = SettingsDao.get(CURRENT_USER_KEY);
  return cachedUserId;
}
