import { PASSWORD_RULES } from "./passwordRules";

/**
 * Checks a new account password against the strength rules.
 * Returns the message for the first rule it breaks, or null when it passes.
 */
export function getPasswordError(password: string): string | null {
  return (
    PASSWORD_RULES.find((rule) => !rule.test.test(password))?.message ?? null
  );
}
