import { pendingWipeWarning } from "@/src/features/settings/core/pending-wipe-warning";

test("reads as a singular sentence for one record", () => {
  expect(pendingWipeWarning(1)).toBe(
    "1 record hasn't reached the server yet. Signing out deletes them for good.",
  );
});

test("reads as a plural sentence for several records", () => {
  expect(pendingWipeWarning(3)).toBe(
    "3 records haven't reached the server yet. Signing out deletes them for good.",
  );
});
