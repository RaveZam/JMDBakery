import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { RouteDetailProvider } from "../context/RouteDetailContext";
import { useRouteDetail } from "../context/useRouteDetail";
import { RouteDetailHeader } from "../components/route-detail-screen-components/RouteDetailHeader";
import { StoreSearchBar } from "../components/route-detail-screen-components/StoreSearchBar";
import { ProvinceList } from "../components/route-detail-screen-components/ProvinceList";
import { StartRouteBar } from "../components/route-detail-screen-components/StartRouteBar";
import { AddProvinceModal } from "../components/create-route-components/addProvinceModal";
import { AddStoreModal } from "../components/create-route-components/addStoreModal";
import { ViewStoreModal } from "../components/route-components/ViewStoreModal";
import { DeleteProvinceModal } from "../components/route-components/DeleteProvinceModal";
import { DeleteStoreModal } from "../components/route-components/DeleteStoreModal";

export default function RouteDetailScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <RouteDetailProvider>
          <RouteDetailContent />
        </RouteDetailProvider>
      </ThemedView>
    </SafeAreaView>
  );
}

function RouteDetailContent() {
  const {
    modal,
    open,
    close,
    routeId,
    swipeableRefs,
    loadProvinces,
    loadStoresForProvince,
    deleteProvince,
    deleteStore,
  } = useRouteDetail();

  const handleDeleteProvinceConfirm = () => {
    if (modal?.type !== "deleteProvince") return;
    deleteProvince(modal.province.id);
    close();
  };

  const handleDeleteStoreConfirm = () => {
    if (modal?.type !== "deleteStore") return;
    deleteStore(modal.store);
    close();
  };

  const handleDeleteStoreCancel = () => {
    if (modal?.type === "deleteStore") {
      swipeableRefs.current[modal.store.id]?.close();
    }
    close();
  };

  return (
    <>
      <RouteDetailHeader />

      <View style={styles.content}>
        <StoreSearchBar />

        <ProvinceList />
      </View>

      <StartRouteBar />

      {/* Modals — driven by the single `modal` state machine */}
      {modal?.type === "addProvince" && routeId && (
        <AddProvinceModal
          routeId={routeId}
          onClose={close}
          onAdded={() => {
            close();
            loadProvinces();
          }}
        />
      )}

      {modal?.type === "addStore" && (
        <AddStoreModal
          provinceId={modal.province.id}
          provinceName={modal.province.name}
          onClose={close}
          onAdded={() => {
            const provinceId = modal.province.id;
            close();
            loadStoresForProvince(provinceId);
          }}
        />
      )}

      {modal?.type === "editStore" && (
        <AddStoreModal
          provinceId={modal.province.id}
          provinceName={modal.province.name}
          initialStore={modal.store}
          onClose={close}
          onAdded={() => {}}
          onUpdated={() => {
            loadStoresForProvince(modal.province.id);
            close();
          }}
        />
      )}

      <ViewStoreModal
        store={modal?.type === "viewStore" ? modal.store : null}
        onClose={close}
      />

      <DeleteProvinceModal
        province={modal?.type === "deleteProvince" ? modal.province : null}
        onConfirm={handleDeleteProvinceConfirm}
        onCancel={close}
      />

      <DeleteStoreModal
        store={modal?.type === "deleteStore" ? modal.store : null}
        onConfirm={handleDeleteStoreConfirm}
        onCancel={handleDeleteStoreCancel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F0EB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F0EB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
});
