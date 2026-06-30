import { useState, useMemo } from "react";
import { View, Text, StyleSheet, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { EndRouteModal } from "../components/EndRouteModal";
import { SessionRouteHeader } from "../components/session-route-screen-components/SessionRouteHeader";
import { SessionStoreItem } from "../components/session-route-screen-components/SessionStoreItem";
import { StoreConnector } from "../components/session-route-screen-components/StoreConnector";
import { ProvinceSectionHeader } from "../components/session-route-screen-components/ProvinceSectionHeader";
import { EndRouteFooter } from "../components/session-route-screen-components/EndRouteFooter";
import useSessionRoute from "../hooks/useSessionRoute";
import { completeSession } from "../services/sessionLocalService";

export default function SessionRouteScreen() {
  const params = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
    sessionId?: string;
  }>();

  const routeName =
    typeof params.routeName === "string" ? params.routeName : "Route";
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : "";

  const { session, sessionStores, visitedCount, totalCount } =
    useSessionRoute(sessionId);

  const [showEndModal, setShowEndModal] = useState(false);

  // Global index map so numbering is continuous across province sections
  const storeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sessionStores.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [sessionStores]);

  // Group stores by province, preserving insertion order
  const sections = useMemo(() => {
    const grouped = new Map<string, typeof sessionStores>();
    sessionStores.forEach((store) => {
      const key = store.province_name ?? "Unknown";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(store);
    });
    return Array.from(grouped.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [sessionStores]);

  const handleEndConfirm = () => {
    if (sessionId) completeSession(sessionId);
    setShowEndModal(false);
    router.push("/main/routes");
  };

  const formattedDate = session?.session_date
    ? new Date(session.session_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <SessionRouteHeader
          routeName={routeName}
          visitedCount={visitedCount}
          totalCount={totalCount}
          formattedDate={formattedDate}
        />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={StoreConnector}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <ProvinceSectionHeader title={section.title} />
          )}
          renderSectionFooter={() => <View style={styles.sectionFooter} />}
          renderItem={({ item }) => (
            <SessionStoreItem
              store={item}
              index={(storeIndexMap.get(item.id) ?? 1) - 1}
              onPress={() =>
                router.push({
                  pathname: "/main/routes/store/[storeId]",
                  params: {
                    storeId: item.store_id,
                    storeName: item.store_name,
                    storeProvince: item.store_province ?? "",
                    storeCity: item.store_city ?? "",
                    storeBarangay: item.store_barangay ?? "",
                    contactName: item.store_contact_name ?? "",
                    provinceName: item.province_name ?? "",
                    sessionStoreId: item.id,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No stores in this session.</Text>
            </View>
          }
        />

        <EndRouteFooter onEndRoute={() => setShowEndModal(true)} />

        <EndRouteModal
          visible={showEndModal}
          onConfirm={handleEndConfirm}
          onCancel={() => setShowEndModal(false)}
        />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionFooter: {
    height: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  },
});
