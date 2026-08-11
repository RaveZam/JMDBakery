/**
 * Device trust: the record that a real session was confirmed on this device.
 *
 * Lives in app_settings rather than with the supabase token, because the whole
 * point is to survive the token expiring. Read by the auth gate to decide
 * whether an offline launch is a returning agent or a fresh install.
 */
import { SettingsDao } from "@/src/lib/dao/settings-dao";
import { setCurrentUserId, setCurrentUserName } from "@/src/lib/current-user";

const LAST_VERIFIED_KEY = "last_verified_session_at";

/**
 * Records user id, username and a last verified timestamp for logging trusted devices (used to track fresh downloads where there has never
 * been an agent registered, and at the same time still allow agents to roam free even if their token "expires")
 */
export function markSessionVerified(
  userId: string,
  userName: string | null,
  now: Date = new Date(),
): void {
  setCurrentUserId(userId);
  setCurrentUserName(userName);
  SettingsDao.set(LAST_VERIFIED_KEY, now.toISOString());
}

/** ISO timestamp of the last confirmed session, or null if there's never been one. */
export function getLastVerifiedAt(): string | null {
  return SettingsDao.get(LAST_VERIFIED_KEY);
}

/**
 * Drops this device's trust, so the next offline launch lands on sign-in.
 
 */
export function clearDeviceTrust(): void {
  SettingsDao.set(LAST_VERIFIED_KEY, null);
  setCurrentUserId(null);
  setCurrentUserName(null);
}
