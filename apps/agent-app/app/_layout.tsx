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
import { runOutboxSync } from "@/src/lib/sync/outbox";
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
  // foreground, and on a periodic interval while the app is active.
  useEffect(() => {
    if (checkingSession) return;

    runOutboxSync();

    const subscription = AppState.addEventListener(
      "change",
      (next: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && next === "active") {
          runOutboxSync();
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
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade_from_bottom",
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
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
