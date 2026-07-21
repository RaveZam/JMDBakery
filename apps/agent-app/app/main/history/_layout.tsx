import { Stack } from "expo-router";
import { Colors } from "@/src/shared/constants/Colors";

export default function HistoryTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    />
  );
}
