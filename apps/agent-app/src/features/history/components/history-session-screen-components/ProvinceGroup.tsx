import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { LoggedItem } from "@/src/features/store/types/store-types";
import type { StoreCreditEntryRow } from "@/src/lib/dao/store-credit-dao";
import type { ProvinceGroup as ProvinceGroupData } from "../../core/session-derived";
import { StoreCard } from "./StoreCard";

type SessionStoreRow = ReturnType<typeof SessionStoresDao.getBySessionId>[number];

type Props = {
  group: ProvinceGroupData<SessionStoreRow>;
  expanded: boolean;
  onToggle: () => void;
  salesByStore: Record<string, LoggedItem[]>;
  paymentsByStore: Record<string, StoreCreditEntryRow[]>;
};

function ProvinceGroupHeader({
  group,
  expanded,
  onToggle,
}: {
  group: ProvinceGroupData<SessionStoreRow>;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.header} activeOpacity={0.7} onPress={onToggle}>
      <View style={styles.iconWrap}>
        <Ionicons name="map-outline" size={15} color="#3F7355" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {group.provinceName}
      </Text>
      <View style={styles.visitedBadge}>
        <Text style={styles.visitedBadgeText}>
          {group.visitedCount}/{group.stores.length} visited
        </Text>
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={16}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );
}

export function ProvinceGroup({
  group,
  expanded,
  onToggle,
  salesByStore,
  paymentsByStore,
}: Props) {
  return (
    <View style={styles.panel}>
      <ProvinceGroupHeader
        group={group}
        expanded={expanded}
        onToggle={onToggle}
      />

      {expanded && (
        <View style={styles.storeList}>
          {group.stores.map((s) => (
            <StoreCard
              key={s.id}
              store={s}
              items={salesByStore[s.id] ?? []}
              payments={paymentsByStore[s.id] ?? []}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1E293B" },
  visitedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F5F5F0",
  },
  visitedBadgeText: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  storeList: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    padding: 8,
    gap: 8,
  },
});
