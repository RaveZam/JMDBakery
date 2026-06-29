import { Stack } from "expo-router";
import HistorySessionScreen from "@/src/features/history/screens/HistorySessionScreen";

export default function SessionDetailRoute() {
  return (
    <>
      <Stack.Screen options={{ animation: "slide_from_right" }} />
      <HistorySessionScreen />
    </>
  );
}
