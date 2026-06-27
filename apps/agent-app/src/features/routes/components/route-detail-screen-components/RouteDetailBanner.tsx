import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  routeName: string;
  provinceCount: number;
  onBack: () => void;
  onAddLocation: () => void;
};

export function RouteDetailBanner({
  routeName,
  provinceCount,
  onBack,
  onAddLocation,
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
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={onAddLocation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowTick} />
          <Text style={styles.eyebrow}>ROUTE</Text>
          <View style={styles.eyebrowDot} />
          <Text style={styles.metaText}>
            {provinceCount === 0
              ? "No provinces yet"
              : `${provinceCount} ${
                  provinceCount === 1 ? "province" : "provinces"
                }`}
          </Text>
        </View>

        <Text style={styles.routeName} numberOfLines={1}>
          {routeName}
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
    justifyContent: "space-between",
    minHeight: 36,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
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
  routeName: {
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
