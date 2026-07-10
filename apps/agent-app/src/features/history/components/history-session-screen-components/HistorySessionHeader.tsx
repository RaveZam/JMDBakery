import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { formatLongDate } from "@/src/shared/helpers/formatLongDate";
import { useHistorySession } from "../../hooks/useHistorySession";

function MissingEndingInventoryBanner() {
  return (
    <View style={styles.warningBanner}>
      <Ionicons name="warning-outline" size={13} color="#92400E" />
      <Text style={styles.warningText}>No Ending Inventory Logged</Text>
    </View>
  );
}

function CancelSessionBanner({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.cancelBanner}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="close-circle-outline" size={14} color="#FCA5A5" />
      <Text style={styles.cancelBannerText}>Cancel Session</Text>
    </TouchableOpacity>
  );
}

export function HistorySessionHeader() {
  const insets = useSafeAreaInsets();
  const { session } = useHistorySession();
  const visitedCount = session.stores.filter((s) => s.visited === 1).length;

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>SESSION DETAIL</Text>
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {session.data?.route_name ?? "Session"}
      </Text>
      <Text style={styles.headerSub}>
        {formatLongDate(session.data?.session_date)}
        {session.data
          ? ` • ${visitedCount} of ${session.stores.length} visited`
          : ""}
      </Text>
      {!session.hasEndingInventory && session.inventory.length > 0 && (
        <MissingEndingInventoryBanner />
      )}
      {session.isOngoing && (
        <CancelSessionBanner onPress={session.actions.confirmCancel} />
      )}
    </View>
  );
}

const HEADER_BG = "#0b4c29";

const styles = StyleSheet.create({
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  backBtn: { marginLeft: -4 },
  headerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#86EFAC",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 13, color: "#BBF7D0", marginTop: 6 },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },

  cancelBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(220, 38, 38, 0.18)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  cancelBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FCA5A5",
  },
});
