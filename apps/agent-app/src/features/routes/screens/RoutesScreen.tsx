import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { Colors } from "@/src/shared/constants/Colors";

import { RouteList } from "../components/routes-screen-components/RouteList";

export default function RoutesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <ThemedView style={styles.container}>
        <RouteList />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
