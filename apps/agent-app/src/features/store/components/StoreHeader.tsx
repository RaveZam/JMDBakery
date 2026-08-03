import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useStoreDetails } from "../hooks/useStoreDetails";
import { useCheckVisit } from "../hooks/useCheckVisit";
import { ConfirmActionModal } from "@/src/shared/components/ConfirmActionModal";

const HEADER_BG = "#0b4c29";

function VisitReminderModal({
  checkVisit,
}: {
  checkVisit: ReturnType<typeof useCheckVisit>;
}) {
  return (
    <ConfirmActionModal
      visible={checkVisit.isReminderVisible}
      onConfirm={checkVisit.leaveAnyway}
      onCancel={checkVisit.stay}
      title="Not marked as visited"
      body="You haven't confirmed this visit yet. Leave without marking it visited?"
      confirmLabel="Leave anyway"
      icon="alert-circle"
    />
  );
}

export function StoreHeader() {
  const insets = useSafeAreaInsets();
  const { store } = useStoreDetails();
  const checkVisit = useCheckVisit();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + (insets.top > 0 ? 12 : 16) },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={checkVisit.requestBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerStoreName} numberOfLines={1}>
            {store?.store_name}
          </Text>
          <Text style={styles.headerLocation} numberOfLines={1}>
            {store?.store_province}
          </Text>
        </View>
        <View style={styles.inProgressBadge}>
          <Text style={styles.inProgressText}>In progress</Text>
        </View>
      </View>
      <VisitReminderModal checkVisit={checkVisit} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerStoreName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  headerLocation: { fontSize: 12, color: "#86EFAC", marginTop: 2 },
  inProgressBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.4)",
    backgroundColor: "rgba(74,222,128,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inProgressText: { fontSize: 11, fontWeight: "600", color: "#4ADE80" },
});
