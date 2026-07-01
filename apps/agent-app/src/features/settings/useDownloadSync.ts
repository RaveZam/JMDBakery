import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { downloadReferenceData } from "@/src/lib/sync/download";

export function useDownloadSync() {
  const [syncing, setSyncing] = useState(false);

  const triggerDownload = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await downloadReferenceData();
      Alert.alert(
        "Download complete",
        `Routes: ${result.routes}  ·  Provinces: ${result.provinces}  ·  Stores: ${result.stores}`,
      );
    } catch (err) {
      Alert.alert(
        "Download failed",
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncing, triggerDownload };
}
