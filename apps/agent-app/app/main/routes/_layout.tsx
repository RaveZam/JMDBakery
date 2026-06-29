import { Stack } from "expo-router";
import { Colors } from "@/src/shared/constants/Colors";

export default function RoutesTabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: { backgroundColor: Colors.light.background },
      }}
    />
  );
}
