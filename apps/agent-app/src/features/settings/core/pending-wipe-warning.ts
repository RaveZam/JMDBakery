/**
 * The line shown before sign-out throws away work that never reached the
 * server. Takes the number of unpushed outbox rows and returns the sentence
 * for the confirmation alert.
 */
export function pendingWipeWarning(pending: number): string {
  const plural = pending === 1 ? "record hasn't" : "records haven't";
  return `${pending} ${plural} reached the server yet. Signing out deletes them for good.`;
}
