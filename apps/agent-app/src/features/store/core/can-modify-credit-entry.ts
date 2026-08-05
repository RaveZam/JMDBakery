type OwnedEntry = {
  recordedBy: string;
  entryType: "credit" | "payment";
  sessionStoreId: string | null;
};

/**
 * Whether the signed-in agent is allowed to correct or remove this ledger
 * entry.
 *
 * Two things have to hold. The entry has to be the agent's own: every agent can
 * read every entry, but Supabase only lets them write back the ones they
 * recorded (`recorded_by = auth.uid()` on the update and delete policies).
 * Editing someone else's entry would save locally and then fail on push,
 * retrying forever, so the answer is needed before the write — not after the
 * server rejects it.
 *
 * And the amount has to be one a correction survives. A credit on the visit
 * being logged is derived from that visit's credit orders — the next add, edit
 * or delete on the order log recomputes it — so a correction typed here would
 * silently revert. Editing the orders is how that number moves. Credits from
 * past visits are never re-derived, and payments never are at all, so both stay
 * correctable.
 *
 * `openSessionStoreId` is the visit currently on screen, or null off a visit
 * (a service checking a write, say), where nothing is being re-derived.
 */
export function canModifyCreditEntry(
  entry: OwnedEntry,
  currentUserId: string | null,
  openSessionStoreId: string | null,
): boolean {
  if (!currentUserId) return false;
  if (entry.recordedBy !== currentUserId) return false;
  if (entry.entryType === "credit" && entry.sessionStoreId !== null) {
    return entry.sessionStoreId !== openSessionStoreId;
  }
  return true;
}
