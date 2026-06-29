import { Stack } from "expo-router";
import { Colors } from "@/src/shared/constants/Colors";

export default function SettingsTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    />
  );
}
