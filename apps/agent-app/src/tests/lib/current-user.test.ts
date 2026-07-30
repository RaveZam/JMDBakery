// The signed-in agent's id has to be readable synchronously and before
// supabase.auth.getSession() resolves, so it lives in the local DB rather than
// only in memory.
import { getCurrentUserId, setCurrentUserId } from "@/src/lib/current-user";
import { SettingsDao } from "@/src/lib/dao/settings-dao";
import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
});

test("is written to the database, not just held in memory", () => {
  setCurrentUserId("agent-9");

  expect(SettingsDao.get("current_user_id")).toBe("agent-9");
});

// The case the in-memory-only version got wrong: a cold launch renders screens
// before the auth check has run, and every store would have read as a
// colleague's.
test("a launch that has not run its auth check yet still knows the agent", () => {
  setCurrentUserId(null); // nothing set in memory this launch
  SettingsDao.set("current_user_id", "agent-9"); // written by a previous one

  expect(getCurrentUserId()).toBe("agent-9");
});

test("signing out clears it from the database too", () => {
  setCurrentUserId("agent-9");

  setCurrentUserId(null);

  expect(SettingsDao.get("current_user_id")).toBeNull();
  expect(getCurrentUserId()).toBeNull();
});
