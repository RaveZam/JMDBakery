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

import { useColorScheme } from "@/src/shared/hooks/useColorScheme";
import { Colors } from "@/src/shared/constants/Colors";
import { useAuthGuard } from "@/src/features/auth/hooks/useAuthGuard";
import { useAppReady } from "@/src/shared/hooks/useAppReady";
import { useSyncScheduler } from "@/src/shared/hooks/useSyncScheduler";
import { SnackbarProvider } from "@/src/shared/hooks/useSnackbar";
import "react-native-get-random-values";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { checking, allowed } = useAuthGuard();
  useAppReady(allowed);
  useSyncScheduler(allowed);

  if (!loaded || checking) {
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
