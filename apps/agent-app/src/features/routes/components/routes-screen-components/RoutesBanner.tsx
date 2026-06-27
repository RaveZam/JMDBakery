import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  routeCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
};

export function RoutesBanner({
  routeCount,
  onOpenHistory,
  onOpenSettings,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#0e5e34", "#0b4c29", "#06351c"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onOpenHistory}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="open-history"
        >
          <Ionicons name="time-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onOpenSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="open-settings"
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowTick} />
          <Text style={styles.eyebrow}>FIELD AGENT</Text>
          <View style={styles.eyebrowDot} />
          <Text style={styles.metaText}>
            {routeCount === 0
              ? "No routes yet"
              : `${routeCount} ${routeCount === 1 ? "route" : "routes"}`}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          Routes
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    minHeight: 36,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  titleBlock: {
    marginTop: 12,
    gap: 4,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  eyebrowTick: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: "#E8B04B",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#E8B04B",
  },
  eyebrowDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#9FC2AC",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9FC2AC",
  },
});
