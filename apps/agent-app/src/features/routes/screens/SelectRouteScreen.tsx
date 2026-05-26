import { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";

import { CreateRouteModal } from "../components/create-route-components/createRouteModal";
import { Header } from "@/components/ui/header";
import { useRoutes } from "../hooks/useRoutes";
import RoutesDao from "@/lib/sqlite/dao/routes-dao";
import { modalStyles as m } from "@/styles/modalStyles";

export default function SelectRouteScreen() {
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});
  const { routes, loadRoutes } = useRoutes();

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return;
    RoutesDao.deleteRoute(pendingDelete.id);
    setPendingDelete(null);
    loadRoutes();
  };

  const handleDeleteCancel = () => {
    if (pendingDelete) {
      swipeableRefs.current[pendingDelete.id]?.close();
    }
    setPendingDelete(null);
  };

  const renderRightActions = (route: { id: string; name: string }) => (
    <TouchableOpacity
      style={styles.deleteAction}
      activeOpacity={0.8}
      onPress={() => setPendingDelete(route)}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <ThemedView style={styles.container}>
        <Header
          title="Routes"
          rightElement={
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/main/routes/history" as any)}
                style={styles.settingsButton}
                testID="open-history"
              >
                <Ionicons name="time-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/main/settings" as any)}
                style={styles.settingsButton}
                testID="open-settings"
              >
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.content}>
          {routes.length > 0 && (
            <Text style={styles.sectionLabel}>
              {routes.length} {routes.length === 1 ? "route" : "routes"}{" "}
              available
            </Text>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {routes.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="map-outline" size={36} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No routes yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the button below to create your first route.
                </Text>
              </View>
            ) : (
              routes.map((route) => (
                <Swipeable
                  key={route.id}
                  ref={(ref) => {
                    swipeableRefs.current[route.id] = ref;
                  }}
                  renderRightActions={() => renderRightActions(route)}
                  rightThreshold={60}
                  overshootRight={false}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.routeCard}
                    onPress={() =>
                      router.push({
                        pathname: "/main/routes/list",
                        params: { routeId: route.id, routeName: route.name },
                      })
                    }
                    testID={`route-item-${route.id}`}
                  >
                    <View style={styles.routeIconWrap}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#1b6e40"
                      />
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      <Text style={styles.routeSubtitle}>
                        Tap to view stores
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#CBD5E1"
                    />
                  </TouchableOpacity>
                </Swipeable>
              ))
            )}
          </ScrollView>
        </View>

        {!showCreateRouteModal && (
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.9}
            onPress={() => setShowCreateRouteModal(true)}
          >
            <LinearGradient
              colors={["#1b6e40", "#0b4c29"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {showCreateRouteModal && (
          <CreateRouteModal
            onClose={() => {
              setShowCreateRouteModal(false);
              loadRoutes();
            }}
          />
        )}

        <Modal
          visible={!!pendingDelete}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={handleDeleteCancel}
        >
          <View style={m.backdrop}>
            <View style={m.content}>
              <View style={m.deleteIconWrap}>
                <Ionicons name="trash-outline" size={28} color="#EF4444" />
              </View>
              <Text style={m.title}>Delete Route</Text>
              <Text style={m.body}>
                Are you sure you want to delete{" "}
                <Text style={m.highlight}>{pendingDelete?.name}</Text>?{"\n"}
                All provinces and stores will be removed.
              </Text>
              <View style={m.buttons}>
                <TouchableOpacity
                  style={m.cancelButton}
                  onPress={handleDeleteCancel}
                >
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={m.deleteButton}
                  onPress={handleDeleteConfirm}
                >
                  <Text style={m.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 100,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  // Route card
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  routeSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  // Swipe delete action
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
    marginLeft: 8,
    gap: 4,
  },
  deleteActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  // Settings
  settingsButton: {
    padding: 6,
  },
  // FAB
  fab: {
    position: "absolute",
    right: 24,
    bottom: 36,
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
