import { StyleSheet, View, ScrollView, Text } from "react-native";

import { CreateRouteModal } from "./CreateRouteModal";
import { RouteCard } from "./RouteCard";
import { EmptyRoutes } from "./EmptyRoutes";
import { CreateRouteFab } from "./CreateRouteFab";
import { DeleteRouteModal } from "./DeleteRouteModal";
import useRoute from "../../hooks/useRoute";

export function RouteList() {
  const { routes, create, del } = useRoute();

  return (
    <>
      <View style={styles.content}>
        {routes.length > 0 && (
          <Text style={styles.sectionLabel}>
            {routes.length} {routes.length === 1 ? "route" : "routes"} available
          </Text>
        )}

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {routes.length === 0 ? (
            <EmptyRoutes />
          ) : (
            routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onRequestDelete={del.requestDelete}
              />
            ))
          )}
        </ScrollView>
      </View>

      <CreateRouteFab onPress={create.openModal} />
      <CreateRouteModal
        visible={create.isModalOpen}
        onCreate={create.addRoute}
        onClose={create.closeModal}
      />
      <DeleteRouteModal
        route={del.routeToDelete}
        onCancel={del.cancelDelete}
        onConfirm={del.confirmDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
