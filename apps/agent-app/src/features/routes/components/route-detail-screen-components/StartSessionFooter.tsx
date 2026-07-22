import { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";

import { useStartSession } from "@/src/features/sessions/hooks/useStartSession";
import { ConfirmActionModal } from "@/src/shared/components/ConfirmActionModal";

export function StartSessionFooter(): React.JSX.Element {
  const { loading, start } = useStartSession();
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.startBtn, loading && styles.startBtnDisabled]}
        activeOpacity={0.85}
        onPress={() => setConfirmVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.startBtnText}>Start Session</Text>
        )}
      </TouchableOpacity>
      <ConfirmActionModal
        visible={confirmVisible}
        onConfirm={() => {
          setConfirmVisible(false);
          start();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  startBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#0b4c29",
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
