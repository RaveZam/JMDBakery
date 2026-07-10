import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type SessionTab = "visits" | "inventory";

type Props = {
  active: SessionTab;
  onChange: (tab: SessionTab) => void;
};

const TABS: { key: SessionTab; label: string }[] = [
  { key: "visits", label: "Visits" },
  { key: "inventory", label: "Inventory" },
];

export function SessionTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segment, isActive && styles.segmentActive]}
              activeOpacity={0.8}
              onPress={() => onChange(tab.key)}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: "#F0F0EB",
  },
  track: {
    flexDirection: "row",
    backgroundColor: "#E7E5DD",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: { fontSize: 13, fontWeight: "600", color: "#6B7563" },
  segmentTextActive: { color: "#0b4c29" },
});
