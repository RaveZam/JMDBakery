import { expect, test } from "vitest";
import { getPasswordError } from "../getPasswordError";

test("a password meeting every rule passes", () => {
  expect(getPasswordError("Bakery#2026")).toBeNull();
});

test("rejects a password shorter than 8 characters", () => {
  expect(getPasswordError("Ab1!")).toBe(
    "Password must be at least 8 characters.",
  );
});

test("rejects a password with no uppercase letter", () => {
  expect(getPasswordError("bakery#2026")).toBe(
    "Password needs an uppercase letter.",
  );
});

test("rejects a password with no lowercase letter", () => {
  expect(getPasswordError("BAKERY#2026")).toBe(
    "Password needs a lowercase letter.",
  );
});

test("rejects a password with no number", () => {
  expect(getPasswordError("Bakery#Pass")).toBe("Password needs a number.");
});

test("rejects a password with no special character", () => {
  expect(getPasswordError("Bakery2026")).toBe(
    "Password needs a special character.",
  );
});

test("a space does not count as a special character", () => {
  expect(getPasswordError("Bakery 2026")).toBe(
    "Password needs a special character.",
  );
});
