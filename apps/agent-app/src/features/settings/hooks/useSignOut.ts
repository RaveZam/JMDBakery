import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { runOutboxSync } from "@/src/lib/sync/outbox";
import { countPendingOutbox } from "@/src/lib/sync/pending-outbox-count";
import { pendingWipeWarning } from "@/src/features/settings/core/pending-wipe-warning";
import { signOutAndWipe } from "@/src/features/settings/services/signOutAndWipe";

type SignOut = { loading: boolean; signOut: () => Promise<void> };

export function useSignOut(): SignOut {
  const [loading, setLoading] = useState(false);

  const wipeAndLeave = useCallback(async () => {
    try {
      await signOutAndWipe();
      router.replace("/auth/sign-in");
    } catch {
      Alert.alert("Sign out failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const warnThenWipe = useCallback(
    (pending: number) => {
      Alert.alert(
        "Unsynced records",
        pendingWipeWarning(pending),
        [
          { text: "Cancel", style: "cancel", onPress: () => setLoading(false) },
          { text: "Sign out anyway", style: "destructive", onPress: wipeAndLeave },
        ],
        // Tapping outside the alert on Android would otherwise leave the
        // button spinning forever.
        { onDismiss: () => setLoading(false) },
      );
    },
    [wipeAndLeave],
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    // One last push, so a wipe on a working connection loses nothing. Failing
    // here is normal out in the field and isn't worth reporting — the pending
    // count below is the real check.
    try {
      await runOutboxSync();
    } catch {}

    const pending = countPendingOutbox();
    if (pending > 0) {
      warnThenWipe(pending);
      return;
    }
    await wipeAndLeave();
  }, [warnThenWipe, wipeAndLeave]);

  return { loading, signOut };
}
