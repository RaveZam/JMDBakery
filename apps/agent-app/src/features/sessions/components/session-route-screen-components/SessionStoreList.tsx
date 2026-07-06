import { ScrollView, StyleSheet, View, Text } from "react-native";

import { SessionStore } from "../../types/session-types";
import { ProvinceSectionHeader } from "./ProvinceSectionHeader";
import { SessionStoreItem } from "./SessionStoreItem";
import { StoreConnector } from "./StoreConnector";

import { useSessionRoute } from "../../context/useSessionRoute";

export function SessionStoreList() {
  const { session } = useSessionRoute();

  if (session.sections.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No stores in this session.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
      {session.sections.map((section) => (
        <View key={section.title}>
          <ProvinceSectionHeader title={section.title} />
          {section.data.map((store, localIndex) => (
            <View key={store.id}>
              {localIndex > 0 ? <StoreConnector /> : null}
              <SessionStoreItem
                store={store}
                index={localIndex}
                onPress={() => session.actions.openStore(store)}
              />
            </View>
          ))}
          <View style={styles.sectionFooter} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
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
