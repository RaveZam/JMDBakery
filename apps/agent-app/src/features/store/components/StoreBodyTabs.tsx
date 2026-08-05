import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const HEADER_BG = "#0b4c29";
const TRACK_BG = "#E7E5DC";
const MUTED = "#64748B";
const WARN = "#EF4444";

export type StoreBodyTab = "orders" | "credits";

type StoreBodyTabsProps = {
  active: StoreBodyTab;
  onChange: (tab: StoreBodyTab) => void;
  outstandingBalance: number;
};

export function StoreBodyTabs({
  active,
  onChange,
  outstandingBalance,
}: StoreBodyTabsProps) {
  return (
    <View style={styles.track}>
      <TabButton
        label="Orders"
        selected={active === "orders"}
        onPress={() => onChange("orders")}
      />
      <TabButton
        label="Credits"
        selected={active === "credits"}
        onPress={() => onChange("credits")}
        badge={outstandingBalance > 0 ? outstandingBalance : undefined}
      />
    </View>
  );
}

function TabButton({
  label,
  selected,
  onPress,
  badge,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, selected && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, selected && styles.tabTextActive]}>
        {label}
      </Text>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>₱{badge.toLocaleString()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: TRACK_BG,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabText: { fontSize: 13, fontWeight: "700", color: MUTED },
  tabTextActive: { color: HEADER_BG },
  badge: {
    backgroundColor: WARN,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
});
