import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useStoreDetails } from "../hooks/useStoreDetails";

const HEADER_BG = "#0b4c29";

export function StoreHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { store } = useStoreDetails();

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
          onPress={() => router.back()}
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
