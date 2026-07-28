import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useColorScheme } from "@/src/shared/hooks/useColorScheme";
import { Colors } from "@/src/shared/constants/Colors";
import { useAuthGuard } from "@/src/shared/hooks/useAuthGuard";
import { useAppReady } from "@/src/shared/hooks/useAppReady";
import { SnackbarProvider } from "@/src/shared/hooks/useSnackbar";
import { runOutboxSync } from "@/src/lib/sync/outbox";
import { runDownloadSync } from "@/src/lib/sync/download";
import "react-native-get-random-values";

const SYNC_INTERVAL_MS = 5_000;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [checkingSession, setCheckingSession] = useState(true);
  const appState = useRef(AppState.currentState);

  useAuthGuard(setCheckingSession);
  useAppReady(checkingSession);

  // Drain the outbox once the DB + session are ready: on launch, on return to
  // foreground, and on a periodic interval while the app is active. Returning
  // to foreground also pulls server-side changes back down.
  useEffect(() => {
    if (checkingSession) return;

    runOutboxSync();

    //This listens to the device from going inactive/background to run outbox sync when it immediately is foregrounded
    const subscription = AppState.addEventListener(
      "change",
      (next: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          next === "active"
        ) {
          runOutboxSync();
          // Also pull down admin-side edits (product prices, deletions). Cheap:
          // it only fetches rows newer than the last sync. Launch is already
          // covered by useAuthGuard.
          runDownloadSync();
        }
        appState.current = next;
      },
    );

    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        runOutboxSync();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [checkingSession]);

  if (!loaded || checkingSession) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SnackbarProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none",
              contentStyle: {
                backgroundColor: Colors[colorScheme ?? "light"].background,
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/sign-in" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SnackbarProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
