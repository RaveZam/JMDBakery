import { StyleSheet, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  routeCount: number;
};

export function RoutesBanner({ routeCount }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#0e5e34", "#0b4c29", "#06351c"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
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
