import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { HistorySessionProvider } from "../context/HistorySessionContext";
import { HistorySessionHeader } from "../components/history-session-screen-components/HistorySessionHeader";
import { SessionTabs, type SessionTab } from "../components/history-session-screen-components/SessionTabs";
import { HistorySessionBody } from "../components/history-session-screen-components/HistorySessionBody";
import { EndingInventoryFab } from "../components/history-session-screen-components/EndingInventoryFab";

export default function HistorySessionScreen() {
  const [tab, setTab] = useState<SessionTab>("visits");

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Stack.Screen options={{ animation: "slide_from_right" }} />
      <HistorySessionProvider>
        <ThemedView style={styles.container}>
          <HistorySessionHeader />
          <SessionTabs active={tab} onChange={setTab} />
          <HistorySessionBody tab={tab} />
          <EndingInventoryFab tab={tab} />
        </ThemedView>
      </HistorySessionProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F0EB" },
  container: { flex: 1, backgroundColor: "#F0F0EB" },
});
