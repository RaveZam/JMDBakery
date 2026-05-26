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
import { useState } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppReady } from "@/hooks/useAppReady";
import "react-native-get-random-values";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [checkingSession, setCheckingSession] = useState(true);

  useAuthGuard(setCheckingSession);
  useAppReady(checkingSession);

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
