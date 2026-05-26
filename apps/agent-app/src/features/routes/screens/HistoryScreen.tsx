import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router, useFocusEffect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import RouteSessionsDao from "@/lib/sqlite/dao/route-sessions-dao";

const HEADER_BG = "#0b4c29";

type SessionRow = ReturnType<typeof RouteSessionsDao.getAll>[number];

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<SessionRow[]>(() =>
    RouteSessionsDao.getAll(),
  );

  useFocusEffect(
    useCallback(() => {
      setSessions(RouteSessionsDao.getAll());
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Stack.Screen options={{ animation: "slide_from_right" }} />
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerLabel}>SESSION HISTORY</Text>
          </View>
          <Text style={styles.headerTitle}>Past Sessions</Text>
          <Text style={styles.headerSub}>
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"}{" "}
            recorded
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyText}>No sessions yet.</Text>
            </View>
          ) : (
            sessions.map((s) => {
              const completed = s.status === "completed";
              return (
                <TouchableOpacity
                  key={s.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/main/routes/history/[sessionId]" as any,
                      params: { sessionId: s.id, routeName: s.route_name },
                    })
                  }
                >
                  <View style={styles.cardIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#1b6e40"
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {s.route_name}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {formatDate(s.session_date)} • {s.conducted_by.slice(0, 5)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      completed ? styles.badgeDone : styles.badgeOngoing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        completed
                          ? styles.badgeTextDone
                          : styles.badgeTextOngoing,
                      ]}
                    >
                      {completed ? "Completed" : "Ongoing"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F0EB" },
  container: { flex: 1, backgroundColor: "#F0F0EB" },

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

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 10 },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyText: { fontSize: 14, color: "#94A3B8" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  cardMeta: { fontSize: 12, color: "#94A3B8" },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeDone: { backgroundColor: "#16A34A", borderColor: "#15803D" },
  badgeOngoing: { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  badgeTextDone: { color: "#FFFFFF" },
  badgeTextOngoing: { color: "#94A3B8" },
});
