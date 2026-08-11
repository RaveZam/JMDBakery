// Device trust has to outlive the supabase token — that's the whole point —
// so these run against the real SQLite engine rather than a mock.
import {
  markSessionVerified,
  getLastVerifiedAt,
  clearDeviceTrust,
} from "@/src/lib/device-trust";
import { getCurrentUserId, getCurrentUserName } from "@/src/lib/current-user";
import { createSchema, resetDb } from "@/src/test-utils/db-test-helpers";

const VERIFIED_AT = new Date("2026-06-30T08:00:00.000Z");

beforeAll(async () => {
  await createSchema();
});

beforeEach(() => {
  resetDb();
});

test("a device that has never signed in has no trust", () => {
  clearDeviceTrust(); // resetDb signs a test agent in; undo that

  expect(getLastVerifiedAt()).toBeNull();
});

test("verifying a session records when it happened and who it was", () => {
  markSessionVerified("agent-9", "Ana", VERIFIED_AT);

  expect(getLastVerifiedAt()).toBe(VERIFIED_AT.toISOString());
  expect(getCurrentUserId()).toBe("agent-9");
  expect(getCurrentUserName()).toBe("Ana");
});

test("a later session moves the window forward", () => {
  markSessionVerified("agent-9", "Ana", VERIFIED_AT);
  const later = new Date("2026-07-02T08:00:00.000Z");

  markSessionVerified("agent-9", "Ana", later);

  expect(getLastVerifiedAt()).toBe(later.toISOString());
});

// Without this, signing out and turning off wifi walks straight back in on the
// leftover grace window.
test("signing out leaves the device untrusted", () => {
  markSessionVerified("agent-9", "Ana", VERIFIED_AT);

  clearDeviceTrust();

  expect(getLastVerifiedAt()).toBeNull();
  expect(getCurrentUserId()).toBeNull();
  expect(getCurrentUserName()).toBeNull();
});
