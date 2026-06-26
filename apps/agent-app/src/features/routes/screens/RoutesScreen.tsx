import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { Colors } from "@/src/shared/constants/Colors";

import { RouteList } from "../components/routes-screen-components/RouteList";

import { Header } from "@/src/shared/components/ui/header";
import { HeaderIconButton } from "@/src/shared/components/ui/header-icon-button";

export default function RoutesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <Header
          title="Routes"
          rightElement={
            <View style={styles.headerActions}>
              <HeaderIconButton
                icon="time-outline"
                onPress={() => router.push("/main/routes/history")}
                testID="open-history"
              />
              <HeaderIconButton
                icon="settings-outline"
                onPress={() => router.push("/main/settings")}
                testID="open-settings"
              />
            </View>
          }
        />

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
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
});
