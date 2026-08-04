import { SettingsDao } from "@/src/lib/dao/settings-dao";

const CURRENT_USER_KEY = "current_user_id";
const CURRENT_USER_NAME_KEY = "current_user_name";

let cachedUserId: string | null = null;
let cachedUserName: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  cachedUserId = userId;
  SettingsDao.set(CURRENT_USER_KEY, userId);
}

/** Null only when nobody has signed in on this device yet. */
export function getCurrentUserId(): string | null {
  if (cachedUserId === null) cachedUserId = SettingsDao.get(CURRENT_USER_KEY);
  return cachedUserId;
}

export function setCurrentUserName(name: string | null): void {
  cachedUserName = name;
  SettingsDao.set(CURRENT_USER_NAME_KEY, name);
}

export function getCurrentUserName(): string | null {
  if (cachedUserName === null) {
    cachedUserName = SettingsDao.get(CURRENT_USER_NAME_KEY);
  }
  return cachedUserName;
}
