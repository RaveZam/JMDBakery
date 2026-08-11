import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { runOutboxSync } from "@/src/lib/sync/outbox";
import { runDownloadSync } from "@/src/lib/sync/download";

const SYNC_INTERVAL_MS = 5_000;

/**
 * Drives outbox push + reference-data pull off AppState alone, so there is
 * one trigger source instead of a mount effect, a foreground listener, and a
 * free-running interval independently overlapping each other.
 */
export function useSyncScheduler(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPushInterval = () => {
      if (interval) return;
      runOutboxSync();
      interval = setInterval(runOutboxSync, SYNC_INTERVAL_MS);
    };

    const stopPushInterval = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };

    if (AppState.currentState === "active") startPushInterval();

    const subscription = AppState.addEventListener(
      "change",
      (next: AppStateStatus) => {
        if (next === "active") {
          startPushInterval();
          runDownloadSync();
        } else {
          stopPushInterval();
        }
      },
    );

    return () => {
      stopPushInterval();
      subscription.remove();
    };
  }, [enabled]);
}
