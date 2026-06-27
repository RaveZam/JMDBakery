import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { Colors } from "@/src/shared/constants/Colors";

import { ProvinceList } from "../components/route-detail-screen-components/ProvinceList";
import { ViewStoreModal } from "../components/route-detail-screen-components/storemodal";
import { AddProvinceModal } from "../components/route-detail-screen-components/AddProvinceModal";
import { RouteDetailBanner } from "../components/route-detail-screen-components/RouteDetailBanner";
import { useStoreDetail } from "../hooks/useStoreDetail";
import { useProvinces } from "../hooks/useProvinces";

export default function RouteDetailScreen() {
  const { routeId, routeName } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
  }>();
  const { store, openStore, closeStore } = useStoreDetail();
  const { provinces, loadProvinces } = useProvinces(routeId ?? "");

  const [showAddProvince, setShowAddProvince] = useState(false);
  const [storeRefresh, setStoreRefresh] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <RouteDetailBanner
          routeName={routeName ?? "Route"}
          provinceCount={provinces.length}
          onBack={() => router.back()}
          onAddLocation={() => setShowAddProvince(true)}
        />
        <ProvinceList
          provinces={provinces}
          onSelectStore={openStore}
          refreshKey={storeRefresh}
        />
      </ThemedView>

      <AddProvinceModal
        routeId={routeId ?? ""}
        visible={showAddProvince}
        onClose={() => setShowAddProvince(false)}
        onAdded={() => {
          setShowAddProvince(false);
          loadProvinces();
        }}
      />

      <ViewStoreModal
        store={store}
        onClose={closeStore}
        onChanged={() => setStoreRefresh((n) => n + 1)}
      />
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
