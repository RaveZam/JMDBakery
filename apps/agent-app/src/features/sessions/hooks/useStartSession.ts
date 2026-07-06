import { useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { startSession, OngoingSessionExistsError } from "../services/sessionLocalService";

export function useStartSession() {
  const { routeId, routeName } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
  }>();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!routeId || !routeName) return;
    setLoading(true);
    try {
      const sessionId = await startSession(routeId, routeName);
      router.replace({
        pathname: "/main/routes/inventory",
        params: { routeId, routeName, sessionId },
      });
    } catch (e) {
      if (e instanceof OngoingSessionExistsError) {
        Alert.alert(
          "Session already running",
          "Finish or Cancel your current session before starting a new one.",
        );
      } else {
        Alert.alert("Couldn't start session", String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, start };
}
