import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { HistorySessionHeader } from "../components/history-session-screen-components/HistorySessionHeader";
import { HistorySessionBody } from "../components/history-session-screen-components/HistorySessionBody";
import { EndingInventoryFab } from "../components/history-session-screen-components/EndingInventoryFab";

export default function HistorySessionScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Stack.Screen options={{ animation: "slide_from_right" }} />
      <ThemedView style={styles.container}>
        <HistorySessionHeader />
        <HistorySessionBody />
        <EndingInventoryFab />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F0EB" },
  container: { flex: 1, backgroundColor: "#F0F0EB" },
});
