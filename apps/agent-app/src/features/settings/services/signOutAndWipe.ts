import { supabase } from "@/src/lib/supabase";
import { clearDeviceTrust } from "@/src/lib/device-trust";
import { clearSessionData } from "@/src/features/settings/services/clearSessionData";

/**
 * Signs the agent out and leaves the device with a clean slate: no Supabase
 * session, no device trust, and no local rows.
 *
 * Phones get handed between agents, so signing out has to take the previous
 * agent's routes, sales and inventory with it. Ending the Supabase session
 * comes first and is allowed to throw — if it fails the caller still has all
 * its data, and can try again. Anything queued in the outbox and not yet
 * pushed is destroyed, so callers should push first and warn about what is
 * left (see countPendingOutbox).
 *
 * @throws whatever supabase.auth.signOut rejects with (typically a network error).
 */
export async function signOutAndWipe(): Promise<void> {
  await supabase.auth.signOut();
  // Without this the offline grace window would let them straight back in.
  clearDeviceTrust();
  clearSessionData();
}
