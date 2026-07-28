import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { EndRouteModal } from "../components/EndRouteModal";
import { SessionRouteHeader } from "../components/session-route-screen-components/SessionRouteHeader";
import { SessionSearchBar } from "../components/session-route-screen-components/SessionSearchBar";
import { SessionStoreList } from "../components/session-route-screen-components/SessionStoreList";
import { EndRouteFooter } from "../components/session-route-screen-components/EndRouteFooter";

export default function SessionRouteScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <SessionRouteHeader />
        <SessionSearchBar />
        <SessionStoreList />
        <EndRouteFooter />
        <EndRouteModal />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b4c29",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F0EB",
  },
});
