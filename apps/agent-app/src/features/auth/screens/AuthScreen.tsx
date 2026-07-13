import type { ReactElement } from "react";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/shared/constants/Colors";
import useLogin from "../hooks/useLogin";
import useSessionRedirect from "../hooks/useSessionRedirect";

export default function AuthScreen(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const offline = useSessionRedirect();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <Ionicons name="storefront-outline" size={28} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account to continue.</Text>

          {offline && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color="#92400E" />
              <Text style={styles.offlineText}>
                No connection — reconnect to resume your session.
              </Text>
            </View>
          )}

          {/* Email */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading || offline ? styles.buttonDisabled : null]}
            onPress={useLogin(email, password)}
            activeOpacity={0.8}
            disabled={loading || offline}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    gap: 12,
  },
  logoWrap: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 10,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    gap: 8,
  },
  inputIcon: {
    width: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    color: Colors.light.text,
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export { AuthScreen };
