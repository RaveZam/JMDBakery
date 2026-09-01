import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHistorySessionContext } from "../../context/HistorySessionContext";
import { filterStoresByQuery, groupStoresByProvince } from "../../core/session-derived";
import { ProvinceGroup } from "./ProvinceGroup";

export function StoresSection() {
  const session = useHistorySessionContext();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const groups = useMemo(
    () => groupStoresByProvince(filterStoresByQuery(session.stores, query)),
    [session.stores, query],
  );
  const isSearching = query.trim().length > 0;

  const toggleGroup = (provinceName: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(provinceName)) next.delete(provinceName);
      else next.add(provinceName);
      return next;
    });
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Stores</Text>

      {session.stores.length > 0 && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {session.stores.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No stores in this session.</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No stores match “{query}”.</Text>
        </View>
      ) : (
        <View style={styles.groupList}>
          {groups.map((group) => (
            <ProvinceGroup
              key={group.provinceName}
              group={group}
              expanded={
                isSearching || groups.length === 1 || expanded.has(group.provinceName)
              }
              onToggle={() => toggleGroup(group.provinceName)}
              salesByStore={session.salesByStore}
              paymentsByStore={session.paymentsByStore}
            />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 6,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A", padding: 0 },
  groupList: { gap: 8 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
