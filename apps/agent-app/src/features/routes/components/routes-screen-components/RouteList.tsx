import { StyleSheet, View, ScrollView } from "react-native";

import { CreateRouteModal } from "./CreateRouteModal";
import { RouteCard } from "./RouteCard";
import { EmptyRoutes } from "./EmptyRoutes";
import { CreateRouteFab } from "./CreateRouteFab";
import { DeleteRouteModal } from "./DeleteRouteModal";
import { RoutesBanner } from "./RoutesBanner";
import useRoute from "../../hooks/useRoute";

type Props = {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
};

export function RouteList({ onOpenHistory, onOpenSettings }: Props) {
  const { routes, create, del } = useRoute();

  return (
    <>
      <RoutesBanner
        routeCount={routes.length}
        onOpenHistory={onOpenHistory}
        onOpenSettings={onOpenSettings}
      />

      <View style={styles.content}>
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
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 100,
  },
});
