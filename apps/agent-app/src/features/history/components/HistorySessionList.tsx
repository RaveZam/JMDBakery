import { FlatList, StyleSheet, View } from "react-native";
import { useHistoryList } from "../hooks/useHistoryList";
import type { SessionRow } from "../hooks/useHistoryList";
import { EmptyHistoryList } from "./EmptyHistoryList";
import { HistorySessionCard } from "./HistorySessionCard";

export function HistorySessionList() {
  const { history } = useHistoryList();

  return (
    <FlatList
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      data={history.sessions}
      keyExtractor={(s: SessionRow) => s.id}
      renderItem={({ item }) => (
        <HistorySessionCard session={item} onDeleted={history.refresh} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={EmptyHistoryList}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  separator: { height: 10 },
});
