import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { Colors } from "@/src/shared/constants/Colors";

import { ProvinceList } from "../components/route-detail-screen-components/ProvinceList";
import { ViewStoreModal } from "../components/route-detail-screen-components/ViewStoreModal";
import { useStoreDetail } from "../hooks/useStoreDetail";

import { Header } from "@/src/shared/components/ui/header";

export default function RouteDetailScreen() {
  const { routeId, routeName } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
  }>();
  const { store, openStore, closeStore } = useStoreDetail();

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <Header title={routeName ?? "Route"} onBack={() => router.back()} />
        <ProvinceList routeId={routeId ?? ""} onSelectStore={openStore} />
      </ThemedView>

      <ViewStoreModal store={store} onClose={closeStore} />
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
