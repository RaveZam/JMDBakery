import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedView } from "@/src/shared/components/ThemedView";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { supabase } from "@/src/lib/supabase";
import { Colors } from "@/src/shared/constants/Colors";
import { useDownloadSync } from "@/src/features/settings/useDownloadSync";
import { clearSessionData } from "@/src/features/settings/services/clearSessionData";
import type { Session } from "@supabase/supabase-js";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { syncing, triggerDownload } = useDownloadSync();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const handleClearSessionData = () => {
    Alert.alert(
      "Clear Session Data",
      "This will delete all sales, session_stores, route_sessions, and outbox records. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearSessionData();
            Alert.alert("Done", "Session data cleared.");
          },
        },
      ],
    );
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.replace("/auth/sign-in");
    } catch (err) {
      Alert.alert("Sign out failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText
            type="defaultSemiBold"
            style={styles.title}
            lightColor={Colors.light.text}
            darkColor={Colors.light.text}
          >
            Settings
          </ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          {session && (
            <View style={styles.sessionCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(session.user.email ?? "?")[0].toUpperCase()}
                </Text>
              </View>

              <View style={styles.sessionRows}>
                <View style={styles.sessionRow}>
                  <Ionicons name="person-outline" size={14} color="#64748B" />
                  <Text style={styles.sessionLabel}>Name</Text>
                  <Text style={styles.sessionValue} numberOfLines={1}>
                    {session.user.user_metadata?.full_name ??
                      session.user.email ??
                      "—"}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.sessionRow}>
                  <Ionicons name="mail-outline" size={14} color="#64748B" />
                  <Text style={styles.sessionLabel}>Email</Text>
                  <Text style={styles.sessionValue} numberOfLines={1}>
                    {session.user.email ?? "—"}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.sessionRow}>
                  <Ionicons name="key-outline" size={14} color="#64748B" />
                  <Text style={styles.sessionLabel}>Session ID</Text>
                  <Text
                    style={[styles.sessionValue, styles.mono]}
                    numberOfLines={1}
                  >
                    {session.access_token.slice(0, 20)}…
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.sessionRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
                  <Text style={styles.sessionLabel}>Role</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {session.user.role ?? "authenticated"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.downloadButton}
          activeOpacity={0.8}
          onPress={triggerDownload}
          disabled={syncing || loading}
        >
          {syncing ? (
            <ActivityIndicator color={Colors.light.tint} />
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={16} color={Colors.light.tint} />
              <Text style={styles.downloadText}>Download Data</Text>
            </>
          )}
        </TouchableOpacity>

        {/* DEV ONLY */}
        <TouchableOpacity
          style={styles.clearSessionButton}
          activeOpacity={0.8}
          onPress={handleClearSessionData}
          disabled={loading}
        >
          <Text style={styles.clearSessionText}>
            [DEV] Clear Session Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.8}
          onPress={handleSignOut}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    backgroundColor: Colors.light.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 6,
  },
  sectionNote: {
    color: "#64748B",
  },
  sessionCard: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  avatarCircle: {
    alignSelf: "center",
    marginTop: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  sessionRows: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  sessionLabel: {
    fontSize: 13,
    color: "#64748B",
    width: 74,
  },
  sessionValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "500",
    textAlign: "right",
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#475569",
  },
  roleBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  downloadButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  downloadText: {
    color: Colors.light.tint,
    fontWeight: "600",
    fontSize: 14,
  },
  clearSessionButton: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  clearSessionText: {
    color: "#F97316",
    fontWeight: "600",
    fontSize: 14,
  },
  signOut: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  signOutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
